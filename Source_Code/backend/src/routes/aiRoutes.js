// backend/src/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua route di sini butuh login
router.use(authMiddleware);

router.post("/generate", aiController.generateContent);
router.get("/quota", aiController.getQuotaStatus); // <--- Route Baru
router.get("/usage-history", aiController.getUsageHistory);
module.exports = router;