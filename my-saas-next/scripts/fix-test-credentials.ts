// scripts/fix-test-credentials.ts
// Auto-fix test credentials in all Playwright test files

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const OLD_EMAIL = 'demo@example.com';
const OLD_PASSWORD = 'demo123456';
const NEW_EMAIL = 'testsprite@test.com';
const NEW_PASSWORD = 'TestSprite123!';

async function fixTestCredentials() {
    console.log('🔧 Fixing test credentials in Playwright tests...\n');

    // Find all test files
    const testFiles = await glob('e2e/**/*.spec.ts', {
        cwd: process.cwd(),
        absolute: true
    });

    console.log(`📁 Found ${testFiles.length} test files\n`);

    let filesModified = 0;
    let replacements = 0;

    for (const file of testFiles) {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        // Count occurrences before replacement
        const emailMatches = (content.match(new RegExp(OLD_EMAIL, 'g')) || []).length;
        const passwordMatches = (content.match(new RegExp(OLD_PASSWORD, 'g')) || []).length;

        if (emailMatches > 0 || passwordMatches > 0) {
            // Replace credentials
            const newContent = content
                .replace(new RegExp(OLD_EMAIL, 'g'), NEW_EMAIL)
                .replace(new RegExp(OLD_PASSWORD, 'g'), NEW_PASSWORD);

            if (newContent !== content) {
                fs.writeFileSync(file, newContent, 'utf-8');
                modified = true;
                filesModified++;
                replacements += emailMatches + passwordMatches;

                console.log(`✅ ${path.basename(file)}`);
                if (emailMatches > 0) console.log(`   - Replaced ${emailMatches} email(s)`);
                if (passwordMatches > 0) console.log(`   - Replaced ${passwordMatches} password(s)`);
            }
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Files modified: ${filesModified}`);
    console.log(`   - Total replacements: ${replacements}`);
    console.log(`\n✅ Credentials updated successfully!\n`);
    console.log(`New credentials:`);
    console.log(`   Email: ${NEW_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
}

fixTestCredentials()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Error:', err);
        process.exit(1);
    });
