// backend/src/routes/complianceRoutes.js
const express = require("express");
const router = express.Router();
const complianceController = require("../controllers/complianceController");
const authMiddleware = require("../middleware/authMiddleware");

// All endpoints require login
router.use(authMiddleware);

// PDP / GDPR Features
router.get("/export", complianceController.exportData);
router.post("/delete-account", complianceController.requestDeletion);

module.exports = router;