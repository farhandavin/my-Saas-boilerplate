const AuthService = require("../services/authService");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../config/prismaClient"); // Pastikan path ini benar
const AppError = require("../utils/AppError");

class AuthController {
  // 1. Register
  register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await AuthService.registerUser({ name, email, password });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  });

  // 2. Login
  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, token } = await AuthService.loginUser({ email, password });
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  });

  // 3. Get Me (Profile) - UPDATED
  // Mengambil data lengkap termasuk status langganan dan penggunaan AI
  getMe = catchAsync(async (req, res, next) => {
    console.log("👉 User dari Token:", req.user);
    try {
      // DEBUG: Cek apa isi req.user hasil decode middleware
      // 1. Cek apakah req.user ada? (Jaga-jaga jika middleware lolos)
      if (!req.user) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Token valid but payload missing" });
      }

      // 2. Ambil ID dengan aman (Support 'id' ATAU 'userId')
      // Ini menangani inkonsistensi antara login Google vs Login Biasa
      const id = req.user.userId || req.user.id;

      if (!id) {
        return res
          .status(400)
          .json({ error: "Invalid Token: No User ID found inside token" });
      }

      // 3. Cari User ke Database
      const user = await prisma.user.findUnique({
        where: {
          id: String(req.user.id), // Pastikan tetap String
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true, // Gunakan 'image' bukan 'avatar' (sesuai saran log error Anda)
          createdAt: true,
          // HAPUS plan, subscriptionStatus, aiUsageCount dari sini!
          // Data tersebut nantinya diambil dari tabel Team.
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("❌ Error di getMe:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Forgot Password (Placeholder)
  forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) return next(new AppError("Email is required", 400));

    res.status(200).json({
      success: true,
      message: `Reset link sent to ${email} (Feature pending implementation)`,
    });
  });

  // 5. Reset Password (Placeholder)
  resetPassword = catchAsync(async (req, res, next) => {
    const { token, newPassword } = req.body;

    res.status(200).json({
      success: true,
      message: "Password reset successfully (Feature pending implementation)",
    });
  });
}

module.exports = new AuthController();
