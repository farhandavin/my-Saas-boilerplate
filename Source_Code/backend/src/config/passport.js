// backend/src/config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("./prismaClient");
const authService = require("../services/authService");

// CONFIGURATION: Handle Local vs Production URLs
// In production (e.g., Vercel/Render), ensure process.env.BACKEND_URL is set.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Dynamic Callback URL
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        const avatar = profile.photos[0]?.value;

        // 1. SEARCH: Check if user exists by Email
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // SCENARIO A: User exists (maybe registered via Email/Password previously)
          // We link the Google Account to the existing record if not linked yet.
          if (!user.providerId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { 
                provider: 'google', 
                providerId: googleId, 
                image: avatar // Update avatar from Google
              }
            });
          }
          return done(null, user);
        }

        // 2. SCENARIO B: New User (Registration)
        // We MUST use authService to ensure a 'Team' is created for them.
        // If we just create a User, they will have no Team and cannot use the app.
        const { user: newUser } = await authService.registerUser({
            name,
            email,
            password: "", // Empty password for SSO users
            companyName: `${name}'s Workspace`, // Auto-generate Team Name
            provider: 'google',
            providerId: googleId,
            image: avatar
        });

        return done(null, newUser);

      } catch (err) {
        console.error("❌ Google Auth Error:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;