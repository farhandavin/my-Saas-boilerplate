// backend/src/middleware/publicApiMiddleware.js
const apiKeyService = require("../services/apiKeyService");

const publicApiMiddleware = async (req, res, next) => {
  try {
    // 1. Ambil Key dari Header
    // Bisa via 'x-api-key' atau 'Authorization: Bearer sk_...'
    let apiKey = req.headers['x-api-key'];
    
    if (!apiKey && req.headers['authorization']) {
      const parts = req.headers['authorization'].split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        apiKey = parts[1];
      }
    }

    if (!apiKey) {
      return res.status(401).json({ error: "Missing API Key" });
    }

    // 2. Validasi Key
    const team = await apiKeyService.validateKey(apiKey);

    if (!team) {
      return res.status(401).json({ error: "Invalid API Key" });
    }

    // 3. Attach Context ke Request
    // Kita set user sebagai "SYSTEM_API" agar Audit Log tetap jalan
    req.user = {
      teamId: team.id,
      userId: "API_ACCESS", // Placeholder user
      team: team
    };
    
    // Set flag khusus
    req.isApiRequest = true; 

    next();
  } catch (error) {
    console.error("Public API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = publicApiMiddleware;