const { PrismaClient } = require("@prisma/client");

// Inisialisasi Prisma Client hanya sekali di sini
const prisma = new PrismaClient();

module.exports = prisma;