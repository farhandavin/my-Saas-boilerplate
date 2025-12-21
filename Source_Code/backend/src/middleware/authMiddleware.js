const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Ambil header
  const authHeader = req.header("Authorization");
  
  // Cek keberadaan token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(' ')[1]; // Ambil token setelah "Bearer"

  try {
    const decoded = jwt.sign(token, process.env.JWT_SECRET); // Perhatikan: ini seharusnya jwt.verify bukan sign
    // KOREKSI: Gunakan verify
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = verified;
    next();
  } catch (error) {
    // Bedakan error token expired vs invalid
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;