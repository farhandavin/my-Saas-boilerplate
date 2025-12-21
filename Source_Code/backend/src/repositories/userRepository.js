const prisma = require('../config/prismaClient');

class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async create(userData) {
    return await prisma.user.create({ data: userData });
  }

  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }
}

module.exports = new UserRepository();