const express = require("express");
const { createTeam, getMyTeams } = require("../controllers/teamController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/create", verifyToken, createTeam);


router.get("/", verifyToken, getMyTeams);

module.exports = router;