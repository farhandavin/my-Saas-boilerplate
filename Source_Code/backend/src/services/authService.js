const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class AuthService {
  async registerUser({ name, email, password }) {
    // 1. Cek User Exist
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // 2. Hash Password (Logika Bisnis)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    const newUser = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Return data bersih (tanpa password)
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async loginUser({ email, password }) {
    // 1. Cek User
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new AppError('Invalid credentials', 401);
    }

    // 2. Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // 3. Generate Token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token };
  }
}

module.exports = new AuthService();