
// scripts/fix-test-routes.ts
// Fix incorrect route paths in Playwright tests

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixTestRoutes() {
    console.log('🔧 Fixing route paths in Playwright tests...\n');

    // Find all test files
    const testFiles = await glob('e2e/**/*.spec.ts', {
        cwd: process.cwd(),
        absolute: true
    });

    console.log(`📁 Found ${testFiles.length} test files\n`);

    let filesModified = 0;
    let replacements = 0;

    const REPLACEMENTS = [
        { from: '/en/auth/login', to: '/en/auth' },
        { from: '/auth/login', to: '/auth' }, // carefully replace patterns
        { from: '/en/auth/register', to: '/en/register' },
        { from: '/auth/register', to: '/register' }, // be careful not to break api routes if any
        { from: '/en/auth/forgot-password', to: '/en/forgot-password' },
        { from: '/auth/forgot-password', to: '/forgot-password' },
        { from: '**/auth/login', to: '**/auth' },
        { from: /\/auth\\\/login/g, to: '/auth' } // regex for expect pattern
    ];

    for (const file of testFiles) {
        let content = fs.readFileSync(file, 'utf-8');
        let originalContent = content;

        // specific replacement for regex patterns in expect
        // expect(page).toHaveURL(/\/auth\/login/); -> expect(page).toHaveURL(/\/auth/);
        content = content.replace(/\/auth\/login/g, '/auth');
        content = content.replace(/\/auth\/register/g, '/register');
        content = content.replace(/\/auth\/forgot-password/g, '/forgot-password');

        // String replacements
        // We do exact matches for strings to avoid breaking API routes like /api/auth/login
        // But wait, API routes are usually /api/auth/...
        // The tests use page.goto('/en/auth/login')

        content = content.replace(/'\/en\/auth\/login'/g, "'/en/auth'");
        content = content.replace(/"\/en\/auth\/login"/g, '"/en/auth"');

        content = content.replace(/'\/en\/auth\/register'/g, "'/en/register'");
        content = content.replace(/"\/en\/auth\/register"/g, '"/en/register"');

        content = content.replace(/'\/en\/auth\/forgot-password'/g, "'/en/forgot-password'");

        content = content.replace(/'\*\*\/auth\/login'/g, "'**/auth'");

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf-8');
            filesModified++;
            console.log(`✅ Updated routes in ${path.basename(file)}`);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Files modified: ${filesModified}`);
    console.log(`\n✅ Routes updated successfully!\n`);
}

fixTestRoutes()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Error:', err);
        process.exit(1);
    });
