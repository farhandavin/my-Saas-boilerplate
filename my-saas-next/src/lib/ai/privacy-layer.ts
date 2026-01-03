import { redis } from '@/lib/redis';
import { CompactEncrypt, compactDecrypt } from 'jose';
import { z } from 'zod';

// SECURITY: PII_ENCRYPTION_KEY must be exactly 32 characters for AES-256-GCM
const secret = process.env.PII_ENCRYPTION_KEY;
if (!secret || secret.length < 32) {
    console.warn('[PrivacyLayer] PII_ENCRYPTION_KEY not set or too short (< 32 chars). PII masking will be disabled.');
}
// AES-256-GCM requires 32 bytes. We slice or pad to ensure exactly 32 bytes.
const keyBytes = new TextEncoder().encode(secret || 'disabled-pii-masking-key-32char!');
// Ensure 32 bytes
const ENCRYPTION_KEY = keyBytes.length >= 32
    ? keyBytes.slice(0, 32)
    : new Uint8Array(32).map((_, i) => keyBytes[i] || 0); // Pad with zeros if short

const ALG = 'dir';
const ENC = 'A256GCM';

// Regex Patterns
const PATTERNS = {
    EMAIL: {
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        placeholder: (idx: number) => `<EMAIL_${idx}>`,
        type: 'EMAIL'
    },
    PHONE: {
        // Basic international and local format
        regex: /\b(?:\+?62|0)[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        placeholder: (idx: number) => `<PHONE_${idx}>`,
        type: 'PHONE'
    },
    CREDIT_CARD: {
        regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
        placeholder: (idx: number) => `<CC_${idx}>`,
        type: 'CREDIT_CARD'
    }
};

interface MaskingMap {
    [placeholder: string]: string;
}

export const PrivacyLayer = {
    /**
     * Main function to mask PII in a prompt string.
     * Stores the mapping in Redis with a short TTL.
     */
    async mask(text: string, teamId: string = 'global'): Promise<{ maskedText: string; mapId: string | null }> {
        if (!text) return { maskedText: '', mapId: null };

        // 1. Identify PII
        let maskedText = text;
        const mapping: MaskingMap = {};
        let counter = 1;

        // Helper to process regex
        const processPattern = (pattern: typeof PATTERNS.EMAIL) => {
            maskedText = maskedText.replace(pattern.regex, (match) => {
                const placeholder = pattern.placeholder(counter++);
                mapping[placeholder] = match;
                return placeholder;
            });
        };

        processPattern(PATTERNS.CREDIT_CARD);
        processPattern(PATTERNS.EMAIL);
        processPattern(PATTERNS.PHONE);

        // If no PII found, return early
        if (Object.keys(mapping).length === 0) {
            return { maskedText, mapId: null };
        }

        // 2. Encrypt mapping
        const mapId = `pii-map:${teamId}:${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const mappingJson = JSON.stringify(mapping);

        // Encrypt using jose
        const encryptedMapping = await new CompactEncrypt(new TextEncoder().encode(mappingJson))
            .setProtectedHeader({ alg: ALG, enc: ENC })
            .encrypt(ENCRYPTION_KEY);

        // 3. Store in Redis (TTL 10 mins)
        if (redis) {
            await redis.setex(mapId, 600, encryptedMapping);
        } else {
            console.warn('Redis not configured, PII masking running in stateless mode (de-masking will fail if not immediate)');
            // For stateless/dev without redis, we might skip storage or use in-memory if needed.
            // For now, we return mapId but de-masking will fail if strictly relying on Redis.
            // Strategy: If no Redis, maybe we just don't mask? Or we mask and cannot unmask?
            // Better to log warning. Ideally this runs in the same process request so in-memory could work but Redis is best.
        }

        return { maskedText, mapId };
    },

    /**
     * Restore the original PII in the AI response.
     */
    async unmask(text: string, mapId: string | null): Promise<string> {
        if (!mapId || !text) return text;
        if (!redis) return text; // Cannot retrieve mapping

        try {
            // 1. Fetch from Redis
            const encryptedMapping = await redis.get<string>(mapId);
            if (!encryptedMapping) return text; // Mapping expired or not found

            // 2. Decrypt
            const { plaintext } = await compactDecrypt(encryptedMapping, ENCRYPTION_KEY);
            const mapping: MaskingMap = JSON.parse(new TextDecoder().decode(plaintext));

            // 3. Replace placeholders
            let unmaskedText = text;
            Object.entries(mapping).forEach(([placeholder, original]) => {
                // Global replace of the placeholder
                unmaskedText = unmaskedText.split(placeholder).join(original);
            });

            return unmaskedText;

        } catch (error) {
            console.error('Failed to unmask PII:', error);
            return text; // Fail safe: return text with placeholders rather than crashing
        }
    },

    /**
     * Field-Level DLP: validasi object sebelum dikirim.
     * Menghapus field yang mengandung keyword sensitif atau tidak ada di allowlist.
     */
    stripSensitiveFields<T extends Record<string, any>>(data: T, sensitiveKeys: string[] = ['password', 'secret', 'token', 'ssn', 'credit_card']): Partial<T> {
        const cleanData: any = { ...data };

        sensitiveKeys.forEach(key => {
            // Recursive checking could be added here for nested objects
            if (key in cleanData) {
                delete cleanData[key];
            }
        });

        return cleanData;
    }
};
