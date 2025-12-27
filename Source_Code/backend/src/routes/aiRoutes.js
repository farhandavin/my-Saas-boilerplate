// backend/src/routes/aiRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const aiController = require("../controllers/aiController");

// Middleware Layers
const verifyToken = require("../middleware/authMiddleware");    // 1. Who are you?
const requireTenant = require("../middleware/tenantMiddleware"); // 2. Which team?
const { restrictTo } = require("../middleware/rbacMiddleware");  // 3. Are you allowed?
const checkAiQuota = require("../middleware/billingMiddleware"); // 4. Can you pay?

// ==============================================================================
// GLOBAL SECURITY: All routes below require a logged-in user and a valid team
// ==============================================================================
router.use(verifyToken);
router.use(requireTenant);

// ==============================================================================
// 1. HIGH-VALUE AI ACTIONS (Quota Deducted)
// ==============================================================================

/**
 * RAG / Document Chat
 * Access: MEMBER, ADMIN, OWNER (Everyone needs to read SOPs)
 */
router.post(
  "/chat-docs",
  checkAiQuota,
  restrictTo("OWNER", "ADMIN", "MEMBER"),
  aiController.chatWithDocs
);

/**
 * General Business Analysis (Ad-hoc)
 * Access: ADMIN, OWNER (Junior members shouldn't spend tokens freely)
 */
router.post(
  "/analyze",
  checkAiQuota,
  restrictTo("OWNER", "ADMIN"),
  aiController.analyzeData
);

/**
 * AI Pre-Check / Report Validation
 * Access: ADMIN, OWNER (For polishing drafts)
 */
router.post(
  "/pre-check",
  checkAiQuota,
  restrictTo("OWNER", "ADMIN"),
  aiController.validateReport
);

/**
 * CEO Digest (Strategic Summary)
 * Access: OWNER ONLY (Contains sensitive financial/margin data)
 */
router.get(
  "/ceo-digest",
  checkAiQuota,
  restrictTo("OWNER"),
  aiController.getCeoDigest
);

/**
 * GENERIC TEMPLATE DISPATCHER
 * Used by frontend for dynamic templates (e.g., { templateId: 'idea-generator' })
 * Access: Depends on the specific template logic, but we default to ADMIN/OWNER here.
 */
router.post(
  "/generate",
  checkAiQuota,
  restrictTo("OWNER", "ADMIN", "MEMBER"),
  aiController.generateFromTemplate
);

// ==============================================================================
// 2. UTILITY ENDPOINTS (Free / No Quota Cost)
// ==============================================================================

// Check remaining tokens
router.get(
  "/quota",
  restrictTo("OWNER", "ADMIN", "MEMBER"),
  (req, res) => {
      // Simple inline handler or move to controller
      // Assuming middleware attached team data:
      res.json({ 
          limit: req.team.aiTokenLimit, 
          used: req.team.aiUsageCount,
          remaining: req.team.aiTokenLimit - req.team.aiUsageCount
      });
  }
);

// View usage logs (Audit)
router.get(
  "/usage-history",
  restrictTo("OWNER", "ADMIN"),
  aiController.getUsageHistory // <--- Panggil fungsi asli
);

module.exports = router;