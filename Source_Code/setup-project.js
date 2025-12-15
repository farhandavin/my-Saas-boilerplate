const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("\x1b[36m%s\x1b[0m", "🚀 Starting SaaS Boilerplate Setup...");

const run = (command, cwd) => {
  try {
    execSync(command, { stdio: 'inherit', cwd });
  } catch (e) {
    console.error(`Error executing ${command}`, e);
    process.exit(1);
  }
};

// 1. Install Dependencies
console.log("\n📦 Installing Root Dependencies...");
run('npm install', '.');

console.log("\n📦 Installing Backend Dependencies...");
run('npm install', './backend');

console.log("\n📦 Installing Frontend Dependencies...");
run('npm install', './frontend');

// 2. Setup .env (Copy example jika belum ada)
const copyEnv = (dir) => {
  const example = path.join(dir, '.env.example');
  const target = path.join(dir, '.env');
  if (fs.existsSync(example) && !fs.existsSync(target)) {
    fs.copyFileSync(example, target);
    console.log(`✅ Created .env in ${dir}`);
  } else {
    console.log(`ℹ️ .env already exists or .env.example missing in ${dir}`);
  }
};

copyEnv('./backend');
// Frontend biasanya pakai .env.local atau .env, sesuaikan
// copyEnv('./frontend'); 

// 3. Database Setup
console.log("\n🗄️ Setting up Database (Prisma Generate & Push)...");
// Pastikan user sudah set URL database di .env backend sebelum ini, 
// atau biarkan script ini gagal dengan pesan instruksi.
try {
    run('npx prisma generate', './backend');
    // Opsional: run('npx prisma db push', './backend'); // Hati-hati ini mengubah DB
    console.log("✅ Prisma Client Generated.");
} catch (error) {
    console.log("⚠️ Database setup skipped. Make sure DATABASE_URL is set in backend/.env");
}

console.log("\n🎉 Setup Complete! Run 'npm run dev' to start.");