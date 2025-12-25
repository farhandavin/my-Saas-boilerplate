// src/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../config/prismaClient");
const { maskPII, createAuditLog } = require("../utils/securityUtils");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

exports.generateContent = async (req, res) => {
  const { userId } = req.user;
  // teamId biasanya String jika menggunakan CUID
  const { teamId, templateId, inputData, useKnowledgeBase } = req.body; 

  try {
    // 1. Validasi Keanggotaan Tim (B2B Security)
    const member = await prisma.teamMember.findUnique({
      where: { 
        userId_teamId: { 
          userId, 
          teamId: teamId // Hapus parseInt jika menggunakan CUID
        } 
      },
      include: { team: true }
    });

    if (!member) return res.status(403).json({ error: "Anda bukan bagian dari tim ini." });

    const team = member.team;

    // 2. Cek Kuota AI Tim
    if (team.aiUsageCount >= team.aiLimitMax) {
      return res.status(403).json({ 
        error: "Kuota AI tim Anda habis.",
        currentUsage: team.aiUsageCount,
        limit: team.aiLimitMax 
      });
    }

    // 3. PII Masking (Mencegah kebocoran data sensitif ke AI Vendor)
    const sanitizedInput = {};
    for (const key in inputData) {
      sanitizedInput[key] = typeof inputData[key] === 'string' 
        ? maskPII(inputData[key]) 
        : inputData[key];
    }

    // 4. Lite RAG (Knowledge Base Retrieval)
    let contextData = "";
    if (useKnowledgeBase) {
      const docs = await prisma.document.findMany({
        where: { teamId: team.id },
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      if (docs.length > 0) {
        contextData = "KONTEKS DOKUMEN INTERNAL:\n" + docs.map(d => d.content).join("\n---\n");
      }
    }

    // 5. Setup AI Model
    // Gunakan model yang stabil: gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 6. Construct Prompt berdasarkan Template
    const prompts = {
      'business-email': `
        ${contextData}
        Gunakan konteks dokumen di atas jika relevan. 
        Tulis email bisnis profesional tentang: ${sanitizedInput.topic}.
      `,
      'report-summary': `Ringkas data berikut secara profesional: ${sanitizedInput.data}`
    };

    const finalPrompt = prompts[templateId] || sanitizedInput.prompt;

    // 7. Eksekusi AI
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // 8. Update Kuota & Audit Log (Atomic Transaction)
    // Menggunakan transaction agar jika salah satu gagal, semua batal
    await prisma.$transaction([
      prisma.team.update({
        where: { id: team.id },
        data: { aiUsageCount: { increment: 1 } }
      }),
      // Pastikan fungsi ini mereturn prisma query jika ingin masuk transaction, 
      // atau biarkan di luar jika ingin 'fire and forget'.
    ]);

    // Audit log tetap dicatat untuk keamanan perusahaan klien
    await createAuditLog(team.id, userId, "AI_GENERATION", { 
      template: templateId,
      inputUsed: sanitizedInput 
    }, req);

    res.json({ 
      success: true, 
      data: text,
      usage: `${team.aiUsageCount + 1}/${team.aiLimitMax}`
    });

  } catch (error) {
    console.error("AI Service Error:", error);
    res.status(500).json({ error: "Gagal memproses AI. Silakan coba lagi nanti." });
  }
};