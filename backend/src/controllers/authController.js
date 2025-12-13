const prisma = require("../prismaClient"); //
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_super_aman";

// Validasi Input
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.errors || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Payload Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        plan: user.plan 
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// --- [PERBAIKAN UTAMA DI SINI] ---
// Ganti nama dari 'getUser' menjadi 'getMe' agar lebih jelas fungsinya
// Fungsi ini mengambil data user SENDIRI berdasarkan Token, bukan Params
exports.getMe = async (req, res) => {
  try {
    // Pastikan route '/me' diproteksi middleware verifyToken
    // req.user.id berasal dari hasil decode token di middleware
    const userId = req.user.id; 

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Logika menentukan Status Langganan untuk Frontend
    let status = 'active';
    if (!user.stripeSubscriptionId) {
       status = 'inactive';
    } else if (user.cancelAtPeriodEnd) {
       status = 'canceled';
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      // TAMBAHAN DATA PENTING UNTUK DASHBOARD:
      stripeSubscriptionId: user.stripeSubscriptionId,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      subscriptionStatus: status // Field buatan agar frontend mudah membacanya
    });
  } catch (error) {
    console.error("Error getMe:", error);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Email tidak ditemukan" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`\n📧 [EMAIL MOCK] Link Reset Password untuk ${email}:`);
    console.log(resetLink);
    console.log("------------------------------------------------------\n");

    res.json({ message: "Link reset password telah dikirim ke email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memproses permintaan" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) return res.status(400).json({ error: "Token tidak valid atau kadaluarsa" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password berhasil diubah! Silakan login." });
  } catch (error) {
    res.status(500).json({ error: "Gagal mereset password" });
  }
};