// backend/src/routes/teamRoutes.js
const express = require("express");
const { createTeam, getMyTeams } = require("../controllers/teamController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Semua route di sini dilindungi oleh verifyToken
router.post("/create", verifyToken, createTeam); // POST /api/teams/create
router.get("/", verifyToken, getMyTeams);        // GET /api/teams

module.exports = router;