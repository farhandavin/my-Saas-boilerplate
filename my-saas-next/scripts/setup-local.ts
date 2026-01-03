import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, '.env.example');

console.log('🚀 Starting One-Click Local Setup...\n');

// 1. Check/Create .env
console.log('checking environment configuration...');
if (!fs.existsSync(ENV_PATH)) {
    console.log('  ⚠️ .env not found. Creating from .env.example...');
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);

    // Generate secrets
    const authSecret = crypto.randomBytes(32).toString('base64');
    const jwtSecret = crypto.randomBytes(32).toString('hex');

    let envContent = fs.readFileSync(ENV_PATH, 'utf-8');

    // Replace secrets
    if (envContent.includes('AUTH_SECRET=')) {
        envContent = envContent.replace(/AUTH_SECRET=.*/, `AUTH_SECRET="${authSecret}"`);
    }
    if (envContent.includes('JWT_SECRET=')) {
        envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET="${jwtSecret}"`);
    }

    fs.writeFileSync(ENV_PATH, envContent);
    console.log('  ✅ .env created with generated secrets.');
} else {
    console.log('  ✅ .env already exists.');
}

// 2. Check Docker Availability
let hasDocker = false;
try {
    execSync('docker --version', { stdio: 'ignore' });
    hasDocker = true;
    console.log('  ✅ Docker is available.');
} catch (e) {
    console.log('  ⚠️ Docker not found. Skipping local DB spin-up.');
}

// 3. Database Setup
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
const currentDbUrl = dbUrlMatch ? dbUrlMatch[1] : '';

// 4. Install Dependencies
console.log('\n📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit', cwd: ROOT_DIR });

// 5. Run Database Setup
console.log('\n🗄️ Setting up database...');
try {
    // Push schema
    console.log('  • Pushing schema...');
    execSync('npm run db:push', { stdio: 'inherit', cwd: ROOT_DIR });

    // Seed data
    console.log('  • Seeding demo data...');
    execSync('npm run db:seed', { stdio: 'inherit', cwd: ROOT_DIR });

    console.log('  ✅ Database ready!');
} catch (error) {
    console.log('\n❌ Database setup failed.');
    console.log('  If using local Docker, make sure "npm run docker:up" is running.');
    console.log('  If using Neon/Supabase, check your DATABASE_URL in .env.');
}

console.log('\n🎉 Setup Complete! Run "npm run dev" to start.');
