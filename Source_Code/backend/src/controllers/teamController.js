// backend/src/controllers/teamController.js
const prisma = require("../prismaClient");

// Helper simpel untuk membuat slug (misal: "Nama Tim" -> "nama-tim")
const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-") + "-" + Math.floor(Math.random() * 1000);
};

exports.createTeam = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // Didapat dari verifyToken middleware

  if (!name) return res.status(400).json({ error: "Team name is required" });

  try {
    const slug = createSlug(name);

    // 1. Buat Team baru sekaligus jadikan User sebagai owner di TeamMember
    const newTeam = await prisma.team.create({
      data: {
        name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: "owner",
          },
        },
      },
    });

    // 2. Update user agar currentTeamId mengarah ke tim baru ini (opsional, untuk UX)
    await prisma.user.update({
      where: { id: userId },
      data: { currentTeamId: newTeam.id },
    });

    res.json({ message: "Team created successfully", team: newTeam });
  } catch (error) {
    console.error("Create Team Error:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
};

exports.getMyTeams = async (req, res) => {
  const userId = req.user.id;

  try {
    // Cari semua entry di TeamMember di mana usernya adalah user yang login
    const memberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: true, // Sertakan data detail Team-nya
      },
    });

    // Rapikan data agar frontend menerima array of teams
    const teams = memberships.map((m) => ({
      ...m.team,
      role: m.role, // Sertakan role user di tim tersebut (owner/member)
    }));

    res.json(teams);
  } catch (error) {
    console.error("Get Teams Error:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};