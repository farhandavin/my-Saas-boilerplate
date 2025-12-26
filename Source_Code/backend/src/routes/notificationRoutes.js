const express = require("express");
const router = express.Router();
const notifController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", notifController.getMyNotifications);
router.patch("/:id/read", notifController.markAsRead);
router.patch("/read-all", notifController.markAllRead);

module.exports = router;