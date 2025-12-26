// backend/src/routes/publicRoutes.js
const express = require("express");
const router = express.Router();
const publicApiMiddleware = require("../middleware/publicApiMiddleware");
const aiController = require("../controllers/aiController");

// Middleware KHUSUS API Key
router.use(publicApiMiddleware);

// Endpoint Generate AI untuk Developer Luar
// Client bisa POST ke: https://api.anda.com/v1/generate
router.post("/generate", aiController.generateContent);

module.exports = router;