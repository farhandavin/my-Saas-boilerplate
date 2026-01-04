import { db } from '@/db';
import { verificationTokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const TokenService = {
    /**
     * Generates a token for Email Verification or Password Reset.
     * Deletes any existing token for the identifier (email).
     */
    async generateToken(email: string) {
        const token = uuidv4();
        const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour expiration

        // Cleanup existing tokens
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

        // Create new token
        await db.insert(verificationTokens).values({
            identifier: email,
            token,
            expires,
        });

        return token;
    },

    /**
     * Verifies a token and consumes it (deletes it) if valid.
     */
    async verifyToken(email: string, token: string) {
        const existingToken = await db.query.verificationTokens.findFirst({
            where: and(
                eq(verificationTokens.identifier, email),
                eq(verificationTokens.token, token)
            )
        });

        if (!existingToken) return null;

        if (new Date(existingToken.expires) < new Date()) {
            // Expired - clean up
            await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));
            return { error: 'expired' };
        }

        // Valid - Consume token
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

        return { success: true, identifier: existingToken.identifier };
    },

    /**
   * Validates a token without consuming it (for UI checks like "Reset Password" page load).
   */
    async validateTokenOnly(token: string) {
        const existingToken = await db.query.verificationTokens.findFirst({
            where: eq(verificationTokens.token, token)
        });

        if (!existingToken) return null;
        if (new Date(existingToken.expires) < new Date()) return { error: 'expired' };

        return { success: true, identifier: existingToken.identifier };
    }
};
