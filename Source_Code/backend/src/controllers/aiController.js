// src/controllers/aiController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../config/prismaClient");
const { maskPII, createAuditLog } = require("../utils/securityUtils");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

exports.generateContent = async (req, res) => {
  const { userId } = req.user;
  const { teamId, templateId, inputData, useKnowledgeBase } = req.body; 

  try {
    // 1. VALIDASI KEANGGOTAAN TIM (B2B Security)
    // Mencari apakah user terdaftar di tim tersebut
    const member = await prisma.teamMember.findUnique({
      where: { 
        userId_teamId: { 
          userId, 
          teamId: teamId 
        } 
      },
      include: { team: true }
    });

    if (!member) {
      return res.status(403).json({ error: "Akses ditolak. Anda bukan bagian dari tim ini." });
    }

    const team = member.team;

    // 2. CEK KUOTA AI TIM
    if (team.aiUsageCount >= team.aiLimitMax) {
      return res.status(403).json({ 
        error: "Kuota AI tim Anda habis.",
        usage: `${team.aiUsageCount}/${team.aiLimitMax}` 
      });
    }

    // 3. PII MASKING (Keamanan Data)
    const sanitizedInput = {};
    for (const key in inputData) {
      sanitizedInput[key] = typeof inputData[key] === 'string' 
        ? maskPII(inputData[key]) 
        : inputData[key];
    }

    // 4. LITE RAG (Ambil Konteks Dokumen Tim)
    let contextData = "";
    if (useKnowledgeBase) {
      const docs = await prisma.document.findMany({
        where: { teamId: team.id },
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      if (docs.length > 0) {
        contextData = "KONTEKS DOKUMEN INTERNAL TIM:\n" + docs.map(d => d.content).join("\n---\n");
      }
    }

    // 5. SETUP AI MODEL & PROMPT
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompts = {
      'business-email': `${contextData}\n\nTulis email bisnis tentang: ${sanitizedInput.topic}`,
      'report-summary': `Ringkas data berikut: ${sanitizedInput.data}`
    };
    const finalPrompt = prompts[templateId] || sanitizedInput.prompt;

    // 6. EKSEKUSI AI
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const generatedText = response.text();

    // 7. ATOMIC TRANSACTION (Update Kuota & Log)
    await prisma.$transaction(async (tx) => {
      // Update pemakaian AI tim
      await tx.team.update({
        where: { id: team.id },
        data: { aiUsageCount: { increment: 1 } }
      });

      // Simpan jejak audit untuk transparansi tim
      await tx.auditLog.create({
        data: {
          teamId: team.id,
          userId: userId,
          action: "AI_GENERATION",
          details: JSON.stringify({ template: templateId, input: sanitizedInput }),
          ipAddress: req.ip
        }
      });
    });

    // 8. RESPONSE BERHASIL
    res.json({ 
      success: true, 
      data: generatedText,
      usage: `${team.aiUsageCount + 1}/${team.aiLimitMax}`
    });

  } catch (error) {
    console.error("AI Service Error:", error);
    res.status(500).json({ error: "Gagal memproses AI. Silakan coba lagi nanti." });
  }
};