
// src/app/api/compliance/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { db } from '@/db';
import { users, teamMembers, teams } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';
import { withCsrfProtection } from '@/lib/csrf';


// POST /api/compliance/delete-account - Request account deletion
export async function POST(req: NextRequest) {
  try {
    // CSRF Protection - prevent cross-site request forgery
    const csrfError = withCsrfProtection(req);
    if (csrfError) return csrfError;

    const token = extractToken(req);
    if (!token) return unauthorized();

    const payload = verifyToken(token);
    if (!payload) return unauthorized('Invalid token');

    const { confirmation } = await req.json();

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json({
        error: 'Please type "DELETE MY ACCOUNT" to confirm'
      }, { status: 400 });
    }

    // Check if user is sole owner of any team
    // 1. Get teams where user is owner
    const ownedMemberships = await db.query.teamMembers.findMany({
      where: and(
        eq(teamMembers.userId, payload.userId),
        eq(teamMembers.role, 'ADMIN')
      ),
      with: {
        team: {
          with: {
            // We need all members to check if other owners exist
            // Note: 'members' relation name depends on schema
            teamMembers: true
          }
        }
      }
    });

    for (const tm of ownedMemberships) {
      if (!tm.team || !tm.team.teamMembers) continue;

      const otherOwners = tm.team.teamMembers.filter(
        (m: any) => m.role === 'ADMIN' && m.userId !== payload.userId
      );

      // If no other owners and > 1 total members, cannot delete (orphan team risk)
      if (otherOwners.length === 0 && tm.team.teamMembers.length > 1) {
        return NextResponse.json({
          error: `You must transfer ownership of team "${tm.team.name}" before deleting your account`
        }, { status: 400 });
      }
    }

    // Delete user (cascade manually or rely on DB FK cascade if configured)
    await db.transaction(async (tx) => {
      // 1. Remove from teams where not sole owner (just delete membership)
      await tx.delete(teamMembers).where(eq(teamMembers.userId, payload.userId));

      // 2. Delete teams where sole owner (and no other members - technically if logic above passed, we are safe)
      // If we simply delete the user, and user is sole owner, the team might persist if no cascade.
      // Drizzle/PG: If schema has ON DELETE CASCADE on ownerId (if exists) or we must delete manually.
      // Since team doesn't direct link to 'owner user' (it uses teamMembers), if we delete all teamMembers of a team, team is empty.
      // We should delete teams where this user was the LAST member.

      for (const tm of ownedMemberships) {
        // Logic: if current user is the only member, delete the team object
        // Note: we already deleted memberships above? No, above is prepared. 
        // Inside Tx:
        // Re-check count or rely on payload logic?
        if (!tm.team || !tm.team.teamMembers) continue;
        if (!tm.teamId) continue;

        if (tm.team.teamMembers.length === 1) {
          await tx.delete(teams).where(eq(teams.id, tm.teamId));
        }
      }

      // 3. Delete user
      await tx.delete(users).where(eq(users.id, payload.userId));
    });

    return NextResponse.json({
      success: true,
      message: 'Your account has been deleted'
    });
  } catch (error: unknown) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
