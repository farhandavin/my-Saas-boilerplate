
// src/services/teamService.ts
import { db } from '@/db';
import { teams, teamMembers, users, invitations, auditLogs } from '@/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { PLAN_LIMITS, Role, BrandingSettings, SmtpSettings } from '@/types';
import crypto from 'crypto';

export const TeamService = {
  // Get all teams for a user - OPTIMIZED: Single query instead of N+1
  async getMyTeams(userId: string) {
    // Fetch team memberships for this user
    const memberships = await db.select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));

    if (memberships.length === 0) {
      return [];
    }

    // Get all team IDs user belongs to
    const teamIds = memberships.map(m => m.teamId).filter((id): id is string => id !== null);

    if (teamIds.length === 0) {
      return [];
    }

    // OPTIMIZED: Single query for all teams
    const teamsData = await db.select()
      .from(teams)
      .where(inArray(teams.id, teamIds));

    // OPTIMIZED: Single aggregation query for member counts
    const memberCounts = await db.select({
      teamId: teamMembers.teamId,
      count: sql<number>`COUNT(*)::int`
    })
      .from(teamMembers)
      .where(inArray(teamMembers.teamId, teamIds))
      .groupBy(teamMembers.teamId);

    // Build lookup map for O(1) access
    const countMap = new Map(memberCounts.map(mc => [mc.teamId, mc.count]));

    // Build result efficiently
    const result = memberships
      .map(membership => {
        const team = teamsData.find(t => t.id === membership.teamId);
        if (!team) return null;

        return {
          ...team,
          memberCount: countMap.get(team.id) || 1,
          myRole: membership.role || 'STAFF',
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return result;
  },


  // Create a new team
  async createTeam(data: { name: string; slug?: string; ownerId: string }) {
    const { name, slug, ownerId } = data;
    const teamSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    return db.transaction(async (tx) => {
      const [team] = await tx.insert(teams).values({
        name,
        slug: teamSlug,
        tier: 'FREE',
        aiTokenLimit: PLAN_LIMITS.FREE.aiTokenLimit,
      }).returning();

      await tx.insert(teamMembers).values({
        userId: ownerId,
        teamId: team.id,
        role: 'ADMIN'
      });

      await tx.insert(auditLogs).values({
        teamId: team.id,
        userId: ownerId,
        action: 'TEAM_CREATED',
        entity: 'team',
        details: `Team "${name}" created`
      });

      return team;
    });
  },

  // Invite a member
  async inviteMember(data: {
    teamId: string;
    email: string;
    role?: Role;
    inviterId: string
  }) {
    const { teamId, email, role = 'STAFF', inviterId } = data;

    // Get team with members
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      with: {
        teamMembers: true,
        invitations: true
      }
    });

    if (!team) throw new Error('Team not found');

    // Check plan limits
    const limit = PLAN_LIMITS[team.tier as keyof typeof PLAN_LIMITS]?.maxMembers || 2;
    const currentCount = team.teamMembers.length + team.invitations.length;

    if (currentCount >= limit) {
      throw new Error(`Plan limit reached. ${team.tier} plan allows max ${limit} members.`);
    }

    // Check if already a member
    // Drizzle doesn't have "some" in findFirst root for relations easily in standard SQL.
    // Better to query user first or check memebership.

    // Check if user exists with email AND is in team
    // Check if user exists with email AND is in team

    // Let's check teamMembers directly joined with users
    // But simplest is check if user exists, then check teamMember

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (user) {
      // Check if already a member of THIS team
      const member = await db.query.teamMembers.findFirst({
        where: and(eq(teamMembers.userId, user.id), eq(teamMembers.teamId, teamId))
      });
      if (member) throw new Error('User is already a team member');

      // 🔒 SECURITY: Check if user is already a member of ANY OTHER team
      const membershipInOtherTeam = await db.query.teamMembers.findFirst({
        where: eq(teamMembers.userId, user.id),
        with: { team: true }
      });

      if (membershipInOtherTeam) {
        throw new Error(
          `This user is already affiliated with "${membershipInOtherTeam.team?.name || 'another company'}". ` +
          `Users can only belong to one organization at a time for security and data isolation.`
        );
      }
    }

    // Check existing invitation
    const existingInvite = await db.query.invitations.findFirst({
      where: and(eq(invitations.teamId, teamId), eq(invitations.email, email))
    });

    if (existingInvite) throw new Error('Invitation already sent to this email');

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(invitations).values({
      email,
      token,
      role,
      teamId,
      expires
    });

    // Audit log
    await db.insert(auditLogs).values({
      teamId,
      userId: inviterId,
      action: 'MEMBER_INVITED',
      entity: 'team',
      details: `Invited ${email} as ${role}`
    });

    return {
      success: true,
      token,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/join-team/${token}`
    };
  },

  // Join a team via invitation token
  async joinTeam(token: string, userId: string) {
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, token),
      with: { team: true }
    });

    if (!invitation) throw new Error('Invalid invitation link');
    if (new Date(invitation.expires) < new Date()) throw new Error('Invitation has expired');

    // Check if already a member
    const existingMember = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, invitation.teamId), eq(teamMembers.userId, userId))
    });

    if (existingMember) throw new Error('You are already a member of this team');

    // Add member and delete invitation
    const result = await db.transaction(async (tx) => {
      const [member] = await tx.insert(teamMembers).values({
        userId,
        teamId: invitation.teamId,
        role: invitation.role as Role
      }).returning();

      await tx.delete(invitations).where(eq(invitations.id, invitation.id));

      await tx.insert(auditLogs).values({
        teamId: invitation.teamId,
        userId,
        action: 'MEMBER_JOINED',
        entity: 'team',
        details: `Joined team via invitation`
      });

      return member;
    });

    return {
      success: true,
      teamName: invitation.team.name,
      teamSlug: invitation.team.slug
    };
  },

  // Get team details
  async getTeamDetails(teamId: string) {
    return db.query.teams.findFirst({
      where: eq(teams.id, teamId),
      with: {
        teamMembers: {
          with: {
            user: {
              columns: { id: true, name: true, email: true, image: true }
            }
          }
        },
        // Drizzle doesn't support _count in "with" directly without setup or extras.
        // We'll stick to members array availability.
      }

    });
  },

  async updateTeam(teamId: string, data: {
    name?: string;
    slug?: string;
    branding?: BrandingSettings;
    smtpSettings?: SmtpSettings;
  }) {
    const [updatedTeam] = await db
      .update(teams)
      .set(data)
      .where(eq(teams.id, teamId))
      .returning();

    return updatedTeam;
  }
};

