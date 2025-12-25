const crypto = require('crypto');
const prisma = require('../config/prismaClient');

// Batasan Plan (Tetap pertahankan ini untuk bisnis SaaS Anda)
const PLAN_LIMITS = {
  Free: { maxMembers: 2 },
  Pro: { maxMembers: 5 },
  Team: { maxMembers: 20 }
};

// 1. Create Team (Pertahankan agar user bisa buat tim baru)
exports.createTeam = async (req, res) => {
  const { name, slug } = req.body;
  const ownerId = req.user.userId;

  try {
    const teamSlug = slug || name.toLowerCase().replace(/ /g, '-') + '-' + Date.now();

    const team = await prisma.team.create({
      data: {
        name,
        slug: teamSlug,
        // Pada skema B2B kita, billing ada di Team, pastikan field sesuai
        plan: "Free", 
        aiLimitMax: 10,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER'
          }
        }
      }
    });

    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get My Teams (Pertahankan untuk Dashboard Sidebar)
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

// 3. Invite Member (Versi Upgrade: Cek Kuota + Generate Token)
exports.inviteMember = async (req, res) => {
  const { teamId, email, role = "MEMBER" } = req.body;
  const userId = req.user.userId;

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId }, // Gunakan teamId langsung jika CUID (string)
      include: { members: true }
    });

    if (!team) return res.status(404).json({ error: "Team tidak ditemukan" });

    // Validasi Plan Limits
    const limit = PLAN_LIMITS[team.plan]?.maxMembers || 2;
    const currentMembers = team.members.length;
    const pendingInvites = await prisma.invitation.count({ where: { teamId: team.id } });

    if (currentMembers + pendingInvites >= limit) {
      return res.status(402).json({ 
        error: `Limit tercapai. Plan ${team.plan} maksimal ${limit} anggota.` 
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Hari

    await prisma.invitation.create({
      data: {
        email,
        token,
        role,
        teamId: team.id,
        expires
      }
    });

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: "Gagal membuat undangan" });
  }
};

// 4. Join Team (Fitur Baru: Proses saat link diklik)
exports.joinTeam = async (req, res) => {
  const { token } = req.params;
  const { userId } = req.user;

  try {
    const invite = await prisma.invitation.findUnique({
      where: { token },
      include: { team: true }
    });

    if (!invite || invite.expires < new Date()) {
      return res.status(400).json({ error: "Link expired atau tidak valid." });
    }

    // Cek apakah user sudah jadi member
    const existingMember = await prisma.teamMember.findFirst({
      where: { teamId: invite.teamId, userId: userId }
    });

    if (existingMember) return res.status(400).json({ error: "Anda sudah di tim ini." });

    await prisma.teamMember.create({
      data: {
        userId: userId,
        teamId: invite.teamId,
        role: invite.role
      }
    });

    await prisma.invitation.delete({ where: { id: invite.id } });

    res.json({ success: true, teamName: invite.team.name });
  } catch (error) {
    res.status(500).json({ error: "Gagal bergabung ke tim" });
  }
};