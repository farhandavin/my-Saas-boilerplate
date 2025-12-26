const prisma = require("../config/prismaClient");
const catchAsync = require("../utils/catchAsync");

exports.getMyNotifications = catchAsync(async (req, res) => {
  const { userId } = req.user;

  const notifs = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20 // Ambil 20 terakhir saja
  });

  // Hitung jumlah yang belum dibaca
  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false }
  });

  res.json({
    success: true,
    data: notifs,
    unreadCount
  });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  await prisma.notification.updateMany({
    where: { id, userId }, // Pastikan milik user sendiri
    data: { isRead: true }
  });

  res.json({ success: true });
});

exports.markAllRead = catchAsync(async (req, res) => {
  const { userId } = req.user;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
  res.json({ success: true });
});