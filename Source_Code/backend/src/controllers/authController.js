// file: backend/src/controllers/authController.js
const AuthService = require("../services/authService");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../config/prismaClient");

class AuthController {
  register = catchAsync(async (req, res) => {
    // Terima companyName dari frontend (opsional, kalau kosong auto-generate)
    const { name, email, password, companyName } = req.body;
    
    const result = await AuthService.registerUser({ 
      name, 
      email, 
      password, 
      companyName 
    });

    res.status(201).json({
      success: true,
      message: "Organization & Account created successfully",
      data: result,
    });
  });

  login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { user, token, team, role } = await AuthService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      // Kirim konteks tim saat login agar UI langsung menyesuaikan
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
        tier: team.tier,
        role: role, 
      }
    });
  });

  getMe = catchAsync(async (req, res) => {
    // Endpoint ini dipakai Frontend untuk "Re-hydrate" session saat reload
    // Kita ambil data fresh dari database berdasarkan token
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, image: true },
    });
    
    // Ambil info Team terkini (karena Tier mungkin baru saja di-upgrade)
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.user.userId,
          teamId: req.user.teamId
        }
      },
      include: { team: true }
    });

    if (!user || !membership) return res.status(401).json({ error: "User or Team not found" });

    res.status(200).json({
      user,
      team: {
        id: membership.team.id,
        name: membership.team.name,
        tier: membership.team.tier,
        role: membership.role,
        aiTokenLimit: membership.team.aiTokenLimit,
        aiUsageCount: membership.team.aiUsageCount
      }
    });
  });
}

module.exports = new AuthController();