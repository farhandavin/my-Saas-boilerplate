// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Ambil header
  const authHeader = req.header("Authorization");
  
  // LOGGING UNTUK DEBUGGING
  // console.log("📥 Incoming Header:", authHeader); 

  // Cek keberadaan token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("⛔ Request ditolak: Tidak ada token Bearer");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.error("⛔ Token Error:", error.message);
    // Bedakan error token expired vs invalid
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;