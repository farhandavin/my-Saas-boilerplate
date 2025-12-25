
// src/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../config/prismaClient");
const { maskPII } = require("../utils/securityUtils");
const { getPrismaClientForTeam } = require("../config/dbRouter");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TEMPLATE_COSTS = {
  'business-email': 1,
  'grammar-check': 1,
  'idea-generator': 2,
  'report-summary': 5,
  'ceo-digest': 10, // Cost lebih mahal karena process heavy
  'default': 1
};

exports.generateContent = async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const { teamId, templateId, inputData, useKnowledgeBase } = req.body; 
  
  const cost = TEMPLATE_COSTS[templateId] || TEMPLATE_COSTS['default'];

  try {
    // 1. Validasi Member
    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: parseInt(userId), teamId: parseInt(teamId) } },
      include: { team: true }
    });

    if (!member) return res.status(403).json({ error: "Akses ditolak." });
    const { team } = member;

    // 2. Smart Quota Check
    const isEnterprise = team.tier === 'ENTERPRISE';
    if (!isEnterprise && (team.aiUsageCount + cost) > team.aiLimitMax) {
      return res.status(429).json({ error: "Kuota kredit tidak mencukupi." });
    }

    // 3. DB Routing
    const teamPrisma = await getPrismaClientForTeam(teamId);
    
    // --- LOGIKA KHUSUS CEO DIGEST (BARU) ---
    let specialContext = "";
    
    if (templateId === 'ceo-digest') {
       // Ambil Log 24 Jam Terakhir
       const yesterday = new Date();
       yesterday.setDate(yesterday.getDate() - 1);
       
       const recentLogs = await teamPrisma.auditLog.findMany({
         where: {
           teamId: String(teamId),
           createdAt: { gte: yesterday }
         },
         orderBy: { createdAt: 'desc' },
         take: 50 // Batasi agar token tidak jebol
       });

       if (recentLogs.length === 0) {
         specialContext = "Tidak ada aktivitas signifikan dalam 24 jam terakhir.";
       } else {
         const logSummary = recentLogs.map(l => `- [${l.createdAt.toISOString().split('T')[1]}] ${l.action}: ${l.details}`).join("\n");
         specialContext = `DATA AKTIVITAS TIM (LOGS):\n${logSummary}\n\nINSTRUKSI: Bertindaklah sebagai Business Intelligence Analyst. Rangkum aktivitas di atas menjadi "CEO Morning Brief" yang singkat, padat, dan menyoroti penggunaan resource atau anomali keamanan. Gunakan format Markdown.`;
       }
    }
    // ---------------------------------------

    // 4. Privacy Layer & RAG Biasa
    const topicText = inputData.topic || inputData.prompt || "";
    const cleanInput = typeof topicText === 'string' ? maskPII(topicText) : "";

    let contextData = "";
    if (useKnowledgeBase && templateId !== 'ceo-digest') {
      const docs = await teamPrisma.document.findMany({
        where: { 
          teamId: String(teamId),
          content: { contains: cleanInput.split(' ')[0] || "" } 
        },
        take: 2
      });
      if (docs.length > 0) {
        contextData = "REFERENSI INTERNAL:\n" + docs.map(d => d.content).join("\n---\n");
      }
    }

    // 5. Prompt Construction
    // Jika CEO Digest, specialContext akan menimpa input biasa
    const finalPrompt = templateId === 'ceo-digest' 
      ? specialContext 
      : `
        ${contextData}
        Template: ${templateId}
        Input: ${JSON.stringify(inputData)}
        Saring Data Sensitif: ${cleanInput}
        Jawab dengan nada profesional.
      `;

    // 6. Eksekusi AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    const responseText = result.response.text();

    // 7. Atomic Update
    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: team.id },
        data: { aiUsageCount: { increment: cost } }
      });

      await teamPrisma.auditLog.create({
        data: {
          teamId: String(teamId),
          userId,
          action: "AI_GENERATION",
          details: `Template: ${templateId} | Cost: ${cost}`,
          ipAddress: req.ip
        }
      });
    });

    res.json({ 
      success: true, 
      data: responseText,
      usage: { used: team.aiUsageCount + cost, limit: team.aiLimitMax, cost }
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Gagal memproses AI." });
  }
};
// Endpoint Baru: Cek Sisa Kuota (Untuk UI)
exports.getQuotaStatus = async (req, res) => {
  const { teamId } = req.query; // atau req.params
  
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { aiUsageCount: true, aiLimitMax: true, plan: true, tier: true }
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    const remaining = team.aiLimitMax - team.aiUsageCount;
    const percentage = Math.round((team.aiUsageCount / team.aiLimitMax) * 100);

    res.json({
      plan: team.plan,
      tier: team.tier,
      used: team.aiUsageCount,
      limit: team.aiLimitMax,
      remaining: remaining > 0 ? remaining : 0,
      percentage: percentage > 100 ? 100 : percentage
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching quota" });
  }
};

exports.getUsageHistory = async (req, res) => {
  const { teamId } = req.query;
  
  try {
    // 1. Tentukan Range Tanggal (30 Hari Terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. Ambil Audit Logs khusus aktivitas AI
    // Catatan: Jika sudah Enterprise (Isolated DB), logic ini harus query ke DB Tenant.
    // Untuk sekarang kita query ke Shared DB atau DB yang aktif.
    const logs = await prisma.auditLog.findMany({
      where: {
        teamId: teamId,
        action: "AI_GENERATION",
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        details: true // Kita butuh ini jika ingin parsing cost
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 3. Grouping by Date (Aggregation)
    // Format data untuk Recharts: { date: "12 Oct", usage: 5 }
    const usageMap = {};

    logs.forEach(log => {
      // Format tanggal: "DD Mon" (misal: 25 Dec)
      const dateKey = log.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      
      // Coba parsing cost dari string details "Cost: 5 Credits"
      // Jika tidak ketemu, anggap 1 request = 1 poin activity
      let cost = 1;
      const match = log.details?.match(/Cost:\s*(\d+)/);
      if (match) {
        cost = parseInt(match[1], 10);
      }

      if (usageMap[dateKey]) {
        usageMap[dateKey] += cost;
      } else {
        usageMap[dateKey] = cost;
      }
    });

    // Konversi object ke array
    const chartData = Object.keys(usageMap).map(date => ({
      date,
      usage: usageMap[date]
    }));

    res.json(chartData);

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Gagal mengambil data analitik." });
  }
};