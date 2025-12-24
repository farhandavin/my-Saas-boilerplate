// src/routes/teamRoutes.js

const express = require("express");

// Import Controller (Pastikan nama fungsi SAMA PERSIS dengan di controller)
const { createTeam, getMyTeams, inviteMember } = require("../controllers/teamController");

// Import Middleware
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Debugging: Cek apakah fungsi berhasil di-load
if (!createTeam || !getMyTeams || !inviteMember) {
    console.error("❌ Error: Salah satu fungsi controller team bernilai UNDEFINED. Cek export di teamController.js");
}

// Route Definitions
router.post("/create", verifyToken, createTeam);
router.get("/", verifyToken, getMyTeams);
router.post("/invite", verifyToken, inviteMember);

module.exports = router;