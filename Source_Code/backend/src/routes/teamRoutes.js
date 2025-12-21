const express = require("express");
const { createTeam, getMyTeams } = require("../controllers/teamController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/teams/create:
 * post:
 * summary: Buat tim baru
 * tags: [Teams]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * properties:
 * name:
 * type: string
 * example: "Tim Marketing"
 * responses:
 * 200:
 * description: Tim berhasil dibuat
 * 401:
 * description: Unauthorized
 */
router.post("/create", verifyToken, createTeam);

/**
 * @swagger
 * /api/teams:
 * get:
 * summary: Ambil daftar tim saya
 * tags: [Teams]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: List tim user
 */
router.get("/", verifyToken, getMyTeams);

module.exports = router;