const prisma = require("../prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const crypto = require("crypto");


const JWT_SECRET = process.env.JWT_SECRET || "rahasia_super_aman"; // Nanti pindah ke .env

// Validasi Input pakai Zod (Agar pro)
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

exports.register = async (req, res) => {
  try {
    // 1. Validasi Input
    const { name, email, password } = registerSchema.parse(req.body);

    // 2. Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    // 3. Hash Password (Security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke DB
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

    // 1. Cari user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // 2. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 3. Buat Token JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      // KIRIM INI KE FRONTEND
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Email tidak ditemukan" });

    // Generate Token Random
    const resetToken = crypto.randomBytes(32).toString("hex");
    // Set Expired 1 Jam dari sekarang
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    // Simpan ke DB
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // --- SIMULASI KIRIM EMAIL (Nanti ganti pakai Resend/Nodemailer) ---
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`\n📧 [EMAIL MOCK] Link Reset Password untuk ${email}:`);
    console.log(resetLink);
    console.log("------------------------------------------------------\n");

    res.json({
      message:
        "Link reset password telah dikirim ke email (Cek Console Backend)",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal memproses permintaan" });
  }
};

// 2. PROSES RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    // Cari user dengan token valid & belum expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // Expiry harus > sekarang
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ error: "Token tidak valid atau kadaluarsa" });

    // Hash Password Baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update User & Hapus Token
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
