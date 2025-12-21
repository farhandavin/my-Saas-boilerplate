const { Resend } = require("resend");
const prisma = require("../prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// Kita standarisasi menggunakan express-validator (Standard Express)
const { validationResult, check } = require("express-validator");

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET is not defined in .env");
}

// ==================================================================
// 1. VALIDATION RULES (Security & Sanitization)
// ==================================================================

exports.validateRegister = [
  check('email', 'Format email tidak valid').isEmail().normalizeEmail(),
  check('password', 'Password minimal 6 karakter').isLength({ min: 6 }),
  // .escape() penting untuk mencegah XSS karena kita hapus xss-clean
  check('name', 'Nama wajib diisi').not().isEmpty().trim().escape() 
];

exports.validateLogin = [
  check('email', 'Email tidak valid').isEmail().normalizeEmail(),
  check('password', 'Password wajib diisi').exists()
];

exports.validateResetPassword = [
  check('newPassword', 'Password baru minimal 6 karakter').isLength({ min: 6 }),
  check('token', 'Token wajib ada').not().isEmpty()
];

// ==================================================================
// 2. CONTROLLER FUNCTIONS
// ==================================================================

/**
 * @desc    Register user baru
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  // 1. Cek Error Validasi
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    // 2. Cek Duplikasi
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    // Security: Jangan kembalikan password hash
    user.password = undefined; 

    res.status(201).json({ 
        success: true,
        message: "User registered successfully", 
        user 
    });
  } catch (error) {
    next(error); // Lempar ke Global Error Handler
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  // 1. Cek Error Validasi
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Security: Gunakan pesan generik untuk mencegah User Enumeration
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: "24h" }
    );

    res.json({ 
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
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Current User Data
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.user diset oleh middleware authMiddleware
    const userId = req.user.userId || req.user.id; 

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Logika Status Langganan
    let status = "active";
    if (!user.stripeSubscriptionId) {
      status = "inactive";
    } else if (user.cancelAtPeriodEnd) {
      status = "canceled";
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      stripeSubscriptionId: user.stripeSubscriptionId,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      subscriptionStatus: status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request Password Reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Security: Jangan beritahu jika email tidak ditemukan (mencegah enumeration)
        // Tapi untuk UX boilerplate, kita return 404 dulu. 
        // Untuk "Premium Security", return 200 msg: "If email exists, link sent."
        return res.status(404).json({ error: "Email not found" });
    }

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 Hour

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Kirim Email via Resend
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev", // Ganti saat production
        to: email,
        subject: "Reset Your Password",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      });

      return res.json({ message: "Password reset link sent to your email" });
    } catch (emailError) {
      console.error("Resend Error:", emailError);
      return res.status(500).json({ error: "Failed to send email" });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password with Token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  // Gunakan validation result dari route
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // Token must be NOT expired
      },
    });

    if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password & Hapus Token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password reset successfully. Please login." });
  } catch (error) {
    next(error);
  }
};