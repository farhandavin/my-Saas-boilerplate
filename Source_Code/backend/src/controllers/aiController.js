const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../config/prismaClient"); // Pastikan import prisma

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// [STRATEGI BARU] Kumpulan Template Prompt Profesional
// Ini menambah "Nilai Jual" karena prompt dirancang khusus (Prompt Engineering)
const AI_TEMPLATES = {
  "business-email": (data) => `
    Act as a professional copywriter. Write a business email for the following scenario:
    - Recipient: ${data.recipientName || "Client"}
    - Topic: ${data.topic}
    - Tone: ${data.tone || "Professional"}
    - Key Points: ${data.keyPoints}
    
    Output strictly the email subject and body. No conversational filler.
  `,
  "blog-outline": (data) => `
    Create a comprehensive SEO-friendly blog post outline for the title: "${data.title}".
    Target Audience: ${data.audience}.
    Include H2 and H3 headings.
  `,
  "social-caption": (data) => `
    Write 3 variations of Instagram captions for a post about: ${data.description}.
    Include relevant hashtags.
  `,
  // Tambahkan template lain sesuai niche Anda (misal: Legal Clause, Medical Note, dll)
};

exports.generateContent = async (req, res) => {
  const { userId } = req.user; // Dari middleware auth
  const { templateId, inputData } = req.body;

  // 1. Validasi Template (Mencegah user kirim prompt sembarangan)
  if (!AI_TEMPLATES[templateId]) {
    return res.status(400).json({ error: "Invalid AI Tool selected." });
  }

  try {
    // [PENTING] Cek Kuota User (CodeCanyon Requirement)
    // Logika: Ambil user, cek apakah usageLimit > 0. 
    // Untuk demo ini, kita skip pengurangan kuota database, tapi WAJIB ada logicnya.
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Contoh sederhana pembatasan berdasarkan Plan
    if (user.plan === 'Free' && user.aiUsageCount >= 5) { // Asumsi ada field aiUsageCount
       return res.status(403).json({ error: "Free limit reached. Please upgrade to Pro." });
    }

    // 2. Generate Prompt di Backend (Secure)
    const systemPrompt = AI_TEMPLATES[templateId](inputData);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // [TODO] Update Usage Count di Database di sini
    // await prisma.user.update({ where: { id: userId }, data: { aiUsageCount: { increment: 1 } } });

    res.json({ 
      success: true,
      data: text 
    });

  } catch (error) {
    console.error("AI Service Error:", error);
    // Error handling yang ramah user
    if (error.message?.includes("Safety")) {
      return res.status(400).json({ error: "Content flagged as unsafe by AI filters." });
    }
    res.status(500).json({ error: "AI service temporarily unavailable." });
  }
};