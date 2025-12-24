const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/prismaClient'); // Pastikan path ini benar
const AppError = require('../utils/AppError');

class AuthController {
  
  // 1. Register
  register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await AuthService.registerUser({ name, email, password });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
        role: user.role,
        plan: user.plan
      }
    });
  });

  // 3. Get Me (Profile) - WAJIB ADA
  getMe = catchAsync(async (req, res, next) => {
    // req.user diset oleh authMiddleware
    const userId = req.user.userId; 
    if (!userId) {
      return next(new AppError('Invalid token payload: userId missing', 401));
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        plan: true,
        subscriptionStatus: true,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json(user);
  });

  // 4. Forgot Password (Placeholder agar tidak error)
  forgotPassword = catchAsync(async (req, res, next) => {
    // TODO: Implementasi logika kirim email reset password
    const { email } = req.body;
    // Mock response agar route tidak crash
    if (!email) return next(new AppError('Email is required', 400));
    
    res.status(200).json({ 
      success: true, 
      message: `Reset link sent to ${email} (Feature pending implementation)` 
    });
  });

  // 5. Reset Password (Placeholder agar tidak error)
  resetPassword = catchAsync(async (req, res, next) => {
    // TODO: Implementasi logika update password
    const { token, newPassword } = req.body;
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully (Feature pending implementation)' 
    });
  });

}

module.exports = new AuthController();