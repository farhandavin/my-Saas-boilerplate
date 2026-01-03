
// src/services/apiKeyService.ts
import crypto from 'crypto';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const ApiKeyService = {
  /**
   * Mengembalikan key mentah SATU KALI saja.
   */
  async createKey(teamId: string, name: string) {
    // 1. Generate Random Key (32 bytes hex)
    // Format: sk_live_...
    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    
    // 2. Hash Key untuk penyimpanan (SHA-256)
    const keyHash = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // 3. Ambil e.g. 10 karakter pertama untuk display (Prefix)
    const prefix = rawKey.substring(0, 10) + '...';

    // 4. Simpan ke DB
    // Drizzle insert returning
    const [apiKeyRecord] = await db.insert(apiKeys).values({
      teamId,
      name,
      prefix,
      keyHash
    } as any).returning();

    // PENTING: Kembalikan rawKey agar bisa ditampilkan ke user SEKALI saja
    return { ...apiKeyRecord, secretKey: rawKey };
  },

  /**
   * Validasi API Key dari request masuk
   */
  async validateKey(rawKey: string) {
    if (!rawKey || !rawKey.startsWith('sk_live_')) return null;

    // 1. Hash key yang diterima
    const incomingHash = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // 2. Cari di DB
    // Drizzle query API doesn't support automatic relation loading unless using query builder
    // verify 'with' syntax support
    const apiKey = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.keyHash, incomingHash),
      with: {
        team: true
      }
    });

    if (!apiKey) return null;

    // 3. Update lastUsedAt (Async, fire-and-forget)
    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id))
      .catch(console.error);

    return apiKey.team;
  }
};