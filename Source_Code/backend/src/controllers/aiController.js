// backend/src/controllers/aiController.js
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Services
const AiService = require("../services/aiService");
const BillingService = require("../services/billingService");
const AuditLogService = require("../services/auditLogService");
const PiiService = require("../services/piiService");
const AnalyticsService = require("../services/analyticsService");
const DocumentService = require("../services/documentService");
const NotificationService = require("../services/notificationService"); // <--- NEW: For Upselling

// Configuration: Token Costs per Action
const TEMPLATE_COSTS = {
  'business-email': 1,
  'grammar-check': 1,
  'idea-generator': 2,
  'report-summary': 5,
  'ceo-digest': 10,
  'pre-check': 3,
  'default': 1
};

class AiController {

  /**
   * 1. GENERAL ANALYSIS (Ad-hoc)
   */
  analyzeData = catchAsync(async (req, res, next) => {
    const { prompt } = req.body;
    const { teamId, userId } = req.user;

    if (!prompt) return next(new AppError("Prompt is required", 400));

    // A. Intelligence
    const safePrompt = PiiService.mask(prompt);
    const aiResponse = await AiService.generateText(safePrompt);
    
    // B. Billing (Atomic)
    const tokenCost = BillingService.calculateCost(safePrompt, aiResponse);
    const updatedQuota = await BillingService.deductToken(teamId, tokenCost);

    // C. Compliance
    await AuditLogService.log({
      teamId, userId, action: "AI_ANALYZE", details: `Tokens: ${tokenCost}`, ip: req.ip
    });

    // D. UPSELL TRIGGER (Background)
    this._triggerBackgroundUpsell(teamId, updatedQuota);

    res.status(200).json({
      success: true,
      data: { answer: aiResponse, meta: { remaining: updatedQuota.remaining } }
    });
  });

  /**
   * 2. CEO DIGEST (Automated Strategy)
   */
  getCeoDigest = catchAsync(async (req, res, next) => {
    const { teamId, userId } = req.user;
    const cost = TEMPLATE_COSTS['ceo-digest'];

    // A. Gather Intelligence
    const [stats, logs] = await Promise.all([
        AnalyticsService.getDailyStats(teamId),
        AuditLogService.getRecentActivity(teamId, 24)
    ]);

    const dataContext = JSON.stringify({ stats, recent_logs: logs }, null, 2);

    // B. Prompt Engineering
    const systemPrompt = `
      Role: Senior Business Consultant.
      Task: Create a "CEO Morning Brief" based on the data below.
      Output Rules: 3-4 Bullet points ONLY. Highlight anomalies. Tone: Executive summary.
      Data: ${dataContext}
    `;

    const aiResponse = await AiService.generateText(systemPrompt);

    // C. Billing
    const updatedQuota = await BillingService.deductToken(teamId, cost);

    await AuditLogService.log({
      teamId, userId, action: "CEO_DIGEST", details: `Charged ${cost} tokens`, ip: req.ip
    });

    // D. UPSELL TRIGGER
    this._triggerBackgroundUpsell(teamId, updatedQuota);

    res.status(200).json({
      success: true,
      data: { digest: aiResponse, meta: { cost, remaining: updatedQuota.remaining } }
    });
  });

  /**
   * 3. AI PRE-CHECK (Assistant Editor)
   */
  validateReport = catchAsync(async (req, res, next) => {
    const { title, content } = req.body;
    const { teamId, userId } = req.user;
    const cost = TEMPLATE_COSTS['pre-check'];

    if (!content) return next(new AppError("Report content is required", 400));

    // A. Security Masking
    const safeContent = PiiService.mask(content);

    // B. Specialized Prompt
    const systemPrompt = `
      ROLE: Senior Business Editor & Auditor.
      TASK: Validate this draft report.
      REPORT TITLE: ${title || "Untitled"}
      CONTENT: """${safeContent}"""
      REQUIREMENTS: Typos/Grammar, Consistency check, PII Check.
      OUTPUT FORMAT: Readiness Score, Critical Findings, Suggestions.
    `;

    const aiResponse = await AiService.generateText(systemPrompt);

    // C. Billing
    const updatedQuota = await BillingService.deductToken(teamId, cost);

    await AuditLogService.log({
      teamId, userId, action: "AI_PRE_CHECK", details: `Report: ${title}`, ip: req.ip
    });

    // D. UPSELL TRIGGER
    this._triggerBackgroundUpsell(teamId, updatedQuota);

    res.status(200).json({
      success: true,
      data: { analysis: aiResponse, meta: { cost, remaining: updatedQuota.remaining } }
    });
  });

  /**
   * 4. DOCUMENT CHAT (RAG)
   */
  chatWithDocs = catchAsync(async (req, res, next) => {
    const { question } = req.body;
    const { teamId, userId } = req.user;

    if (!question) return next(new AppError("Question is required", 400));

    // A. Retrieval
    const context = await DocumentService.findRelevantContext(teamId, question);

    const systemPrompt = `
      You are an internal expert. Answer based ONLY on this context:
      ${context || "No relevant info found."}
      Question: ${question}
    `;

    // B. Generation
    const aiResponse = await AiService.generateText(systemPrompt);
    
    // C. Billing
    const tokenCost = BillingService.calculateCost(systemPrompt, aiResponse);
    const updatedQuota = await BillingService.deductToken(teamId, tokenCost);

    await AuditLogService.log({ teamId, userId, action: "DOC_CHAT", details: question });

    // D. UPSELL TRIGGER
    this._triggerBackgroundUpsell(teamId, updatedQuota);

    res.status(200).json({
      success: true,
      data: { answer: aiResponse, sources: context ? "Internal Docs" : "None" }
    });
  });

  /**
   * 5. TEMPLATE DISPATCHER
   */
  generateFromTemplate = catchAsync(async (req, res, next) => {
    const { templateId, inputData } = req.body;

    switch (templateId) {
      case 'ceo-digest':
        return this.getCeoDigest(req, res, next);
      case 'pre-check':
        req.body.title = inputData.title;
        req.body.content = inputData.content || inputData.prompt;
        return this.validateReport(req, res, next);
      case 'doc-chat':
        req.body.question = inputData.question || inputData.prompt;
        return this.chatWithDocs(req, res, next);
      default:
        req.body.prompt = inputData.prompt;
        return this.analyzeData(req, res, next);
    }
  });

  // =========================================================================
  // INTERNAL HELPERS
  // =========================================================================

  /**
   * Checks if quota usage has hit thresholds (e.g., 80%, 100%) and sends alerts.
   * Runs in background to avoid slowing down the AI response.
   */
  _triggerBackgroundUpsell(teamId, quotaData) {
    // Assuming quotaData contains { aiUsageCount, aiTokenLimit }
    // If not, BillingService.deductToken should be updated to return these.
    
    if (!quotaData || !quotaData.aiTokenLimit) return;

    NotificationService.checkUpsellTrigger(
      teamId, 
      quotaData.aiUsageCount, 
      quotaData.aiTokenLimit
    ).catch(err => {
      // Log silently, don't crash the request
      console.error(`⚠️ Upsell Trigger Warning for Team ${teamId}:`, err.message);
    });
  }
}

module.exports = new AiController();