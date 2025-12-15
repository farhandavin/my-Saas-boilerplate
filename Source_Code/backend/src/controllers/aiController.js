const { GoogleGenerativeAI } = require("@google/generative-ai");

// Cek API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

exports.generateContent = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- MODIFIKASI DI SINI ---
    // Kita tambahkan instruksi paksa agar output selalu Inggris
    // Walaupun user nanya "Buatkan ide konten", AI akan jawab pakai B.Inggris
    const finalPrompt = `${prompt}\n\n(Please provide the response strictly in English language)`;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (error) {
    console.error("Gemini Error Detail:", error);
    
    // Error handling (Saya ubah jadi B.Inggris juga pesan errornya)
    if (error.message && error.message.includes("fetch failed")) {
       return res.status(503).json({ 
         error: "Connection to Google AI failed. Please check your internet connection or Node.js version." 
       });
    }

    res.status(500).json({ 
      error: "AI service is currently unavailable. Please try again later." 
    });
  }
};