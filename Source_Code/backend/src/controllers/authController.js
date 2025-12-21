const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

class AuthController {
  // Menggunakan catchAsync, tidak perlu try-catch block
  register = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    
    // Panggil Service
    const user = await AuthService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  });

  login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    // Panggil Service
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
}

module.exports = new AuthController();