const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../prismaClient");

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mysaas-api.vercel.app' // Ganti dengan URL Backend Render kamu yang sebenarnya
  : 'http://localhost:5001';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Cek apakah user sudah ada berdasarkan googleId
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        // 2. Jika tidak ada, cek berdasarkan email (mungkin user pernah daftar manual)
        if (!user) {
          user = await prisma.user.findUnique({
            where: { email: profile.emails[0].value },
          });

          // Jika user ditemukan via email, update googleId-nya
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { 
                googleId: profile.id,
                avatar: profile.photos[0]?.value 
              },
            });
          } else {
            // 3. Jika benar-benar user baru, buat user baru
            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos[0]?.value,
                password: null, // Tidak perlu password
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