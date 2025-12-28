// src/services/teamService.ts
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS, Role } from '@/types';
import crypto from 'crypto';

export const TeamService = {
  // Get all teams for a user
  async getMyTeams(userId: string) {
    return prisma.team.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        _count: { select: { members: true } },
        members: {
          where: { userId },
          select: { role: true }
        }
      }
    });
  },

  // Create a new team
  async createTeam(data: { name: string; slug?: string; ownerId: string }) {
    const { name, slug, ownerId } = data;
    const teamSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    return prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name,
          slug: teamSlug,
          tier: 'FREE',
          aiTokenLimit: PLAN_LIMITS.FREE.aiTokenLimit,
        }
      });

      await tx.teamMember.create({
        data: {
          userId: ownerId,
          teamId: team.id,
          role: 'OWNER'
        }
      });

      await tx.auditLog.create({
        data: {
          teamId: team.id,
          userId: ownerId,
          action: 'TEAM_CREATED',
          details: `Team "${name}" created`
        }
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
    const { teamId, email, role = 'MEMBER', inviterId } = data;

    // Get team with members
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { 
        members: true,
        invitations: true
      }
    });

    if (!team) throw new Error('Team not found');

    // Check plan limits
    const limit = PLAN_LIMITS[team.tier as keyof typeof PLAN_LIMITS]?.maxMembers || 2;
    const currentCount = team.members.length + team.invitations.length;

    if (currentCount >= limit) {
      throw new Error(`Plan limit reached. ${team.tier} plan allows max ${limit} members.`);
    }

    // Check if already a member
    const existingMember = await prisma.user.findFirst({
      where: { 
        email,
        teamMembers: { some: { teamId } }
      }
    });

    if (existingMember) throw new Error('User is already a team member');

    // Check existing invitation
    const existingInvite = await prisma.invitation.findFirst({
      where: { teamId, email }
    });

    if (existingInvite) throw new Error('Invitation already sent to this email');

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role,
        teamId,
        expires
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        teamId,
        userId: inviterId,
        action: 'MEMBER_INVITED',
        details: `Invited ${email} as ${role}`
      }
    });

    return { 
      success: true, 
      token,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/join-team/${token}`
    };
  },

  // Join a team via invitation token
  async joinTeam(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { team: true }
    });

    if (!invitation) throw new Error('Invalid invitation link');
    if (invitation.expires < new Date()) throw new Error('Invitation has expired');

    // Check if already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: { teamId: invitation.teamId, userId }
    });

    if (existingMember) throw new Error('You are already a member of this team');

    // Add member and delete invitation
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.teamMember.create({
        data: {
          userId,
          teamId: invitation.teamId,
          role: invitation.role
        }
      });

      await tx.invitation.delete({ where: { id: invitation.id } });

      await tx.auditLog.create({
        data: {
          teamId: invitation.teamId,
          userId,
          action: 'MEMBER_JOINED',
          details: `Joined team via invitation`
        }
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
    return prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true }
            }
          }
        },
        _count: { select: { members: true, documents: true } }
      }
    });
  }
};
