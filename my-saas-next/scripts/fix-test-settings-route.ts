// scripts/fix-test-settings-route.ts
// Fix incorrect /settings/ routes to /setting/ (singular)

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixSettingsRoute() {
    console.log('🔧 Fixing /settings/ routes to /setting/ ...\n');

    const testFiles = await glob('e2e/**/*.spec.ts', {
        cwd: process.cwd(),
        absolute: true
    });

    console.log(`📁 Found ${testFiles.length} test files\n`);

    let filesModified = 0;
    let replacements = 0;

    for (const file of testFiles) {
        let content = fs.readFileSync(file, 'utf-8');
        const originalContent = content;

        // Replace /dashboard/settings/ with /dashboard/setting/
        const matches = (content.match(/\/dashboard\/settings\//g) || []).length;
        content = content.replace(/\/dashboard\/settings\//g, '/dashboard/setting/');

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf-8');
            filesModified++;
            replacements += matches;
            console.log(`✅ ${path.basename(file)} - ${matches} replacements`);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Files modified: ${filesModified}`);
    console.log(`   - Total replacements: ${replacements}`);
    console.log(`\n✅ Routes updated: /settings/ → /setting/`);
}

fixSettingsRoute()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Error:', err);
        process.exit(1);
    });
