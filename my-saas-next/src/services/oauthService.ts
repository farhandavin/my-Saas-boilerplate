
// src/services/oauthService.ts
// Google OAuth/SSO Service

import { db } from '@/db';
import { users, teams, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
// SECURITY: JWT_SECRET is required - no fallback to prevent authentication bypass
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required for authentication');
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export const OAuthService = {
  /**
   * Generate Google OAuth authorization URL
   */
  getGoogleAuthUrl(): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const options = {
      redirect_uri: GOOGLE_REDIRECT_URI,
      client_id: GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  },

  /**
   * Exchange authorization code for tokens
   */
  async getGoogleTokens(code: string): Promise<{ access_token: string; id_token: string; refresh_token?: string }> {
    const url = 'https://oauth2.googleapis.com/token';

    const values = {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(values),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to get Google tokens');
    }

    return response.json();
  },

  /**
   * Get user info from Google using access token
   */
  async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get Google user info');
    }

    return response.json();
  },

  /**
   * Handle Google OAuth callback - create or login user
   */
  async handleGoogleCallback(code: string): Promise<{ token: string; user: any; team: any; isNewUser: boolean }> {
    // 1. Exchange code for tokens
    const tokens = await this.getGoogleTokens(code);

    // 2. Get user info from Google
    const googleUser = await this.getGoogleUserInfo(tokens.access_token);

    if (!googleUser.verified_email) {
      throw new Error('Email not verified with Google');
    }

    // 3. Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.email, googleUser.email),
      with: {
        teamMembers: {
          with: { team: true }
        }
      }
    });

    let isNewUser = false;

    if (!user) {
      // 4a. Create new user and team transactionally
      isNewUser = true;

      const slug = googleUser.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

      const result = await db.transaction(async (tx) => {
        const [newUser] = await tx.insert(users).values({
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.picture,
          password: '', // No password for OAuth users
          provider: 'google',
        }).returning();

        const [newTeam] = await tx.insert(teams).values({
          name: `${googleUser.given_name}'s Team`,
          slug,
          tier: 'FREE',
          aiTokenLimit: 1000,
        }).returning();

        await tx.insert(teamMembers).values({
          userId: newUser.id,
          teamId: newTeam.id,
          role: 'ADMIN'
        });

        return newUser;
      });

      // Refetch user with relations to satisfy return type
      user = await db.query.users.findFirst({
        where: eq(users.id, result.id),
        with: { teamMembers: { with: { team: true } } }
      });

    } else {
      // 4b. Update existing user with Google info if needed
      if (!user.image || !user.provider) {
        // Drizzle update
        await db.update(users)
          .set({
            image: googleUser.picture,
            provider: 'google'
          })
          .where(eq(users.id, user.id));

        // Refetch to get updated object in memory if needed, or just patch local
        user.image = googleUser.picture;
        user.provider = 'google';
      }
    }

    if (!user) throw new Error("Unexpected error: User not found after creation");

    // 5. Get primary team (first team)
    const primaryMembership = user.teamMembers[0];
    if (!primaryMembership) {
      throw new Error('User has no team membership');
    }

    // 6. Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        teamId: primaryMembership.teamId,
        role: primaryMembership.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        provider: user.provider,
      },
      team: {
        id: primaryMembership.team?.id || '',
        name: primaryMembership.team?.name || 'Unknown Team',
        tier: primaryMembership.team?.tier || 'FREE',
        role: primaryMembership.role,
      },
      isNewUser,
    };
  },

  /**
   * Link Google account to existing user
   */
  async linkGoogleAccount(userId: string, code: string): Promise<void> {
    const tokens = await this.getGoogleTokens(code);
    const googleUser = await this.getGoogleUserInfo(tokens.access_token);

    // Check if email matches
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.email !== googleUser.email) {
      throw new Error('Google email does not match account email');
    }

    await db.update(users)
      .set({
        image: googleUser.picture,
        provider: 'google'
      })
      .where(eq(users.id, userId));
  },
};
