const express = require("express");
const { generateContent } = require("../controllers/aiController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Route
router.post("/generate", verifyToken, generateContent);

module.exports = router;