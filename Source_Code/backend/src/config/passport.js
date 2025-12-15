const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../prismaClient");

// --- REKOMENDASI ---
// Ambil URL dari Environment Variable yang Anda set di Vercel/Render.
// Jika tidak ada (sedang di local), otomatis pakai localhost.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      // ... (kode logika user di bawahnya sudah benar, biarkan saja) ...
      try {
        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
        if (!user) {
          user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, avatar: profile.photos[0]?.value },
            });
          } else {
            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos[0]?.value,
                password: null,
              },
            });
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;