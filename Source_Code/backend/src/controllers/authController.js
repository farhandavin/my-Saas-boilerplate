// backend/src/controllers/authController.js
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = require("../prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET is not defined in .env");
}

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    // 1. Validate Input
    const { name, email, password } = registerSchema.parse(req.body);

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Handle Zod Validation Errors nicely
    const errorMessage = error.errors
      ? error.errors[0].message
      : "Registration failed";
    res.status(400).json({ error: errorMessage });
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 3. Generate Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * @desc    Get current logged-in user data
 * @route   GET /api/auth/me
 * @access  Private (Bearer Token)
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id; // From middleware

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Determine Subscription Status for Frontend UI
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
      plan: user.plan,
      stripeSubscriptionId: user.stripeSubscriptionId,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      subscriptionStatus: status,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Email not found" });

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 Hour

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // In production, use an email service (e.g., Resend, SendGrid)
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Kirim Email
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev", // Ganti dengan domain verifikasi nanti
        to: email,
        subject: "Reset Your Password",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
      });

      // ✅ Tambahkan return disini
      return res.json({ message: "Email reset sent successfully" });
    } catch (error) {
      // ✅ Tambahkan return disini juga
      return res.status(500).json({ error: "Failed to send email" });
    }

   

  } catch (error) {
    console.error("Forgot Password Error:", error);
    // Pastikan tidak mengirim respon jika headers sudah terkirim (safety check)
    if (!res.headersSent) {
        return res.status(500).json({ error: "Request failed" });
    }
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // Validate Token & Expiry
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Password & Clear Token
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
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
