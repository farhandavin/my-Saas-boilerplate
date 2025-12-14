const OpenAI = require("openai");

// Pastikan user punya API KEY sendiri di .env atau Anda menyediakan proxy
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateContent = async (req, res) => {
  const { prompt } = req.body;

  // Validasi User Plan sebelum akses AI (Fitur Premium)
  // Asumsi req.user sudah ada dari middleware verifyToken
  // Cek database apakah user/team ini plan-nya 'pro' atau 'team'
  
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo", // Atau gpt-4 untuk plan mahal
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate AI content" });
  }
};