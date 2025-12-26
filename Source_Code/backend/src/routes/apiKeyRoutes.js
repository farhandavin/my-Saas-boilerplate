// backend/src/routes/apiKeyRoutes.js
const express = require("express");
const router = express.Router();
const apiKeyController = require("../controllers/apiKeyController");
const authMiddleware = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/rbacMiddleware"); // Pastikan sudah import ini

router.use(authMiddleware);

// Hanya OWNER dan ADMIN yang boleh kelola kunci
router.post("/", restrictTo("OWNER", "ADMIN"), apiKeyController.create);
router.get("/", restrictTo("OWNER", "ADMIN"), apiKeyController.list);
router.delete("/:id", restrictTo("OWNER", "ADMIN"), apiKeyController.revoke);

module.exports = router;