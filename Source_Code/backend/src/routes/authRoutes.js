const express = require("express");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const { register, login, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register user baru
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - email
 * - password
 * properties:
 * name:
 * type: string
 * email:
 * type: string
 * password:
 * type: string
 * responses:
 * 201:
 * description: User registered successfully
 * 400:
 * description: Validation error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Authenticate user
 * description: Verifies credentials and returns a JWT access token.
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * example: user@example.com
 * password:
 * type: string
 * format: password
 * example: secret123
 * responses:
 * 200:
 * description: Authentication successful.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * token:
 * type: string
 * description: JWT Bearer token.
 * 401:
 * description: Invalid email or password.
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 * get:
 * summary: Get current user profile
 * tags: [Authentication]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: User profile data
 * 401:
 * description: Unauthorized
 */
router.get("/me", verifyToken, getMe);

// Route lainnya (tanpa swagger dulu agar aman, atau tambahkan dengan hati-hati)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const frontendURL = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${frontendURL}/auth?token=${token}`);
  }
);

module.exports = router;