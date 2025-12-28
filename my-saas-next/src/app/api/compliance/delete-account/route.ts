// src/app/api/compliance/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken, unauthorized } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

// POST /api/compliance/delete-account - Request account deletion
export async function POST(req: NextRequest) {
  try {
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
    const ownedTeams = await prisma.teamMember.findMany({
      where: { 
        userId: payload.userId, 
        role: 'OWNER' 
      },
      include: {
        team: {
          include: {
            members: true
          }
        }
      }
    });

    for (const tm of ownedTeams) {
      const otherOwners = tm.team.members.filter(
        m => m.role === 'OWNER' && m.userId !== payload.userId
      );
      
      if (otherOwners.length === 0 && tm.team.members.length > 1) {
        return NextResponse.json({ 
          error: `You must transfer ownership of team "${tm.team.name}" before deleting your account` 
        }, { status: 400 });
      }
    }

    // Delete user (cascade will handle related records based on schema)
    await prisma.$transaction(async (tx) => {
      // Remove from teams where not sole owner
      await tx.teamMember.deleteMany({
        where: { userId: payload.userId }
      });

      // Delete teams where sole owner and no other members
      for (const tm of ownedTeams) {
        if (tm.team.members.length === 1) {
          await tx.team.delete({ where: { id: tm.team.id } });
        }
      }

      // Delete user
      await tx.user.delete({ where: { id: payload.userId } });
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Your account has been deleted' 
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
