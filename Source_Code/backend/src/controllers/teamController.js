// src/controllers/teamController.js

const prisma = require("../config/prismaClient");
const crypto = require("crypto");

// Definisi Batasan Plan
const PLAN_LIMITS = {
  Free: { maxMembers: 2 },
  Pro: { maxMembers: 5 },
  Team: { maxMembers: 20 }
};

// 1. Create Team
exports.createTeam = async (req, res) => {
  const { name, slug } = req.body;
  // Pastikan user ID diambil dari req.user (hasil middleware auth)
  const ownerId = req.user ? req.user.userId : null;

  if (!ownerId) {
    return res.status(400).json({ error: "User ID not found in token" });
  }

  try {
    const teamSlug = slug || name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

    const team = await prisma.team.create({
      data: {
        name,
        slug: teamSlug,
        ownerId
      }
    });

    await prisma.teamMember.create({
      data: {
        userId: ownerId,
        teamId: team.id,
        role: 'owner'
      }
    });

    res.json({ success: true, team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Get My Teams
exports.getMyTeams = async (req, res) => {
    const userId = req.user.userId;
    try {
        const teams = await prisma.team.findMany({
            where: {
                members: { some: { userId } }
            },
            include: {
                _count: { select: { members: true } }
            }
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Invite Member
exports.inviteMember = async (req, res) => {
  const { teamId, email, role } = req.body;
  const userId = req.user.userId;

  try {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
      include: { 
        members: true,
        owner: true
      }
    });

    if (!team) return res.status(404).json({ error: "Team not found" });
    if (team.ownerId !== userId) {
      return res.status(403).json({ error: "Only team owner can invite members." });
    }

    const ownerPlan = team.owner.plan || "Free";
    const limit = PLAN_LIMITS[ownerPlan]?.maxMembers || 2;
    const currentCount = team.members.length;
    
    const pendingInvites = await prisma.invitation.count({ where: { teamId: team.id } });

    if ((currentCount + pendingInvites) >= limit) {
      return res.status(402).json({ 
        error: `Upgrade required. Your ${ownerPlan} plan is limited to ${limit} members.` 
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.invitation.create({
      data: {
        email,
        teamId: team.id,
        role: role || "member",
        token,
        expiresAt
      }
    });

    res.json({ message: "Invitation created!", token }); 

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};