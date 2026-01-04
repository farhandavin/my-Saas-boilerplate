// scripts/fix-typescript-errors.ts
// Run with: npx tsx scripts/fix-typescript-errors.ts

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const srcDir = './src';

// Pattern to match: error.message or err.message where error/err is unknown
const patterns = [
    // Pattern 1: error.message in JSON responses - add getErrorMessage import
    {
        find: /\} catch \(error: unknown\) \{\n(\s*).*error\.message/g,
        addImport: true,
    },
    // Pattern 2: err.message
    {
        find: /\} catch \(err: unknown\) \{\n(\s*).*err\.message/g,
        addImport: true,
    },
];

// Files to fix
const filesToFix: string[] = [];

function findFiles(dir: string) {
    const files = readdirSync(dir);
    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            findFiles(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            filesToFix.push(fullPath);
        }
    }
}

function fixFile(filePath: string): boolean {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Check if file has error: unknown pattern with .message access
    if (content.includes('error: unknown') || content.includes('err: unknown')) {
        // Check if it accesses .message directly
        const hasErrorMessage = /catch \((error|err): unknown\)[\s\S]*?\1\.message/.test(content);

        if (hasErrorMessage) {
            // Check if import already exists
            const hasImport = content.includes("from '@/lib/error-utils'");

            if (!hasImport) {
                // Add import at the top after other imports
                const importStatement = "import { getErrorMessage } from '@/lib/error-utils';\n";

                // Find the last import line
                const importMatch = content.match(/^import .+$/gm);
                if (importMatch && importMatch.length > 0) {
                    const lastImport = importMatch[importMatch.length - 1];
                    content = content.replace(lastImport, lastImport + '\n' + importStatement);
                } else {
                    content = importStatement + content;
                }
                modified = true;
            }

            // Replace error.message with getErrorMessage(error)
            content = content.replace(
                /catch \((error): unknown\)([\s\S]*?)error\.message/g,
                'catch (error: unknown)$2getErrorMessage(error)'
            );

            // Replace err.message with getErrorMessage(err)
            content = content.replace(
                /catch \((err): unknown\)([\s\S]*?)err\.message/g,
                'catch (err: unknown)$2getErrorMessage(err)'
            );

            modified = true;
        }
    }

    if (modified) {
        writeFileSync(filePath, content, 'utf-8');
        return true;
    }

    return false;
}

// Main
console.log('🔍 Finding TypeScript files...');
findFiles(srcDir);
console.log(`📁 Found ${filesToFix.length} files`);

let fixedCount = 0;
for (const file of filesToFix) {
    try {
        if (fixFile(file)) {
            console.log(`✅ Fixed: ${file}`);
            fixedCount++;
        }
    } catch (e) {
        console.error(`❌ Error fixing ${file}:`, e);
    }
}

console.log(`\n🎉 Fixed ${fixedCount} files`);
console.log('\nRun: npx tsc --noEmit to verify');
