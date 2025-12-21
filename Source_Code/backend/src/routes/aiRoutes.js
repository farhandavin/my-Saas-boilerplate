const express = require("express");
const { generateContent } = require("../controllers/aiController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/ai/generate:
 * post:
 * summary: Generate konten AI
 * tags: [AI Tools]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - prompt
 * properties:
 * prompt:
 * type: string
 * example: "Buatkan tagline untuk kopi"
 * responses:
 * 200:
 * description: Berhasil generate konten
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * result:
 * type: string
 */
router.post("/generate", verifyToken, generateContent);

module.exports = router;