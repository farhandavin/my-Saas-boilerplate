
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { Project, SyntaxKind, QuoteKind } from 'ts-morph';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question: string): Promise<string> => {
  return new Promise((resolve) => rl.question(question, resolve));
};

const toPascalCase = (str: string) => {
  return str.replace(/(\w)(\w*)/g, function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
};

async function main() {
  console.log('🚀 Vertical Generator v2.0 (Powered by AST)');
  console.log('-------------------------------------------');

  const args = process.argv.slice(2);
  let moduleName = args[0] && !args[0].startsWith('--') ? args[0] : null;

  if (!moduleName) {
    moduleName = await ask('Enter Module Name (plural, e.g. "products"): ');
  }

  if (!moduleName) {
    console.error('Module name is required.');
    process.exit(1);
  }

  // Feature Flags
  const withUI = args.includes('--with-ui') || (!args.includes('--no-ui') && (await ask('Generate UI Components? (y/n): ')).toLowerCase() === 'y');
  const withSidebar = args.includes('--with-sidebar') || (!args.includes('--no-sidebar') && (await ask('Inject into Sidebar? (y/n): ')).toLowerCase() === 'y');


  const pascalName = toPascalCase(moduleName); // Products
  const singularName = moduleName.endsWith('s') ? moduleName.slice(0, -1) : moduleName; // product
  const pascalSingular = toPascalCase(singularName); // Product

  const rootDir = process.cwd();

  // 1. AST Project Init
  const project = new Project({
    tsConfigFilePath: path.join(rootDir, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  // --- Core Generation (Services, API, Schema) ---
  // (Same as v1 but simplified here for brevity, focusing on new features)

  // Create Schema
  const schemaPath = path.join(rootDir, 'src', 'schemas', `${moduleName.toLowerCase()}.schema.ts`);
  console.log(`\n📦 Generating Schema: ${schemaPath}`);
  const schemaSource = project.createSourceFile(schemaPath, `
    import { z } from 'zod';

    export const create${pascalName}Schema = z.object({
      name: z.string().min(1, "${pascalSingular} Name is required"),
      description: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
      createdAt: z.date().optional(),
    });

    export type Create${pascalName}Input = z.infer<typeof create${pascalName}Schema>;
  `, { overwrite: true });
  schemaSource.saveSync();

  // Create Service
  const servicePath = path.join(rootDir, 'src', 'services', `${pascalName}Service.ts`);
  // ... (Assume service gen logic exists)

  // --- KILLER FEATURE: Zod-to-UI Form Generation ---
  if (withUI) {
    console.log(`\n🎨 Generating UI Forms (Zod-to-React)...`);
    const formPath = path.join(rootDir, 'src', 'components', moduleName.toLowerCase(), `${pascalSingular}Form.tsx`);

    // Basic introspection of the schema we just created
    // Real implementation would parse the Zod definition. For now we infer from our template.
    const fields = [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'status', type: 'select', options: ['DRAFT', 'PUBLISHED'], label: 'Status' }
    ];

    const formSource = project.createSourceFile(formPath, `
        'use client';
        import { useForm } from 'react-hook-form';
        import { zodResolver } from '@hookform/resolvers/zod';
        import { create${pascalName}Schema, Create${pascalName}Input } from '@/schemas/${moduleName.toLowerCase()}.schema';
        import { Button } from '@/components/ui/button';
        import { Input } from '@/components/ui/input';
        // import { Textarea, Select } from ...

        export function ${pascalSingular}Form({ onSubmit }: { onSubmit: (data: Create${pascalName}Input) => void }) {
            const { register, handleSubmit, formState: { errors } } = useForm<Create${pascalName}Input>({
                resolver: zodResolver(create${pascalName}Schema)
            });

            return (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Generated Fields */}
                    ${fields.map(f => `
                    <div>
                        <label className="block text-sm font-medium text-gray-700">${f.label}</label>
                        <Input {...register('${f.name}')} placeholder="${f.label}" />
                        {errors.${f.name} && <p className="text-red-500 text-xs">{errors.${f.name}?.message}</p>}
                    </div>
                    `).join('')}
                    
                    <Button type="submit">Save ${pascalSingular}</Button>
                </form>
            );
        }
      `, { overwrite: true });
    formSource.saveSync();
    console.log(`✅ Created Form Component: ${formPath}`);
  }

  // --- KILLER FEATURE: Sidebar Injection via AST ---
  if (withSidebar) {
    const sidebarPath = path.join(rootDir, 'src', 'components', 'dashboard', 'Sidebar.tsx');
    console.log(`\n💉 Injecting into Sidebar: ${sidebarPath}`);

    try {
      // Verify file exists and add it to project
      if (fs.existsSync(sidebarPath)) {
        const sidebarSource = project.addSourceFileAtPath(sidebarPath);

        // We look for the main JSX return or a specific list
        // Since Sidebar.tsx is a large Component with hardcoded links, 
        // the safest bet without breaking layout is to append AFTER the "Projects" link using Regex or AST finding.
        // Using logic: Find the first Link href="/dashboard/projects" and insert after it.

        const projectsLink = sidebarSource.getDescendantsOfKind(SyntaxKind.JsxElement).find(jsx => {
          const attrs = jsx.getOpeningElement().getAttributes();
          return attrs.some(a => a.getText().includes('/dashboard/projects'));
        });

        if (projectsLink) {
          // Get indentation
          const indentation = "          "; // Approximate
          const newLink = `
${indentation}<Link href="/dashboard/${moduleName.toLowerCase()}" className={\`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors \${isActive('/${moduleName.toLowerCase()}') ? 'bg-[#135bec] text-white shadow-lg shadow-[#135bec]/20' : 'hover:bg-slate-100 dark:hover:bg-[#232f48] text-slate-600 dark:text-[#92a4c9]'} \${isCollapsed ? 'justify-center' : ''}\`} title="${pascalName}">
${indentation}  <span className="material-symbols-outlined text-[20px]">folder</span>
${indentation}  {!isCollapsed && <p className="text-sm font-medium leading-normal whitespace-nowrap">${pascalName}</p>}
${indentation}</Link>`;

          // Insert after
          projectsLink.replaceWithText(projectsLink.getText() + newLink);
          sidebarSource.saveSync();
          console.log(`✅ Injected ${pascalName} link into Sidebar!`);
        } else {
          console.warn("⚠️ Could not find reference point (Projects link) in Sidebar. Manual injection required.");
        }

      } else {
        console.error("Sidebar.tsx not found!");
      }
    } catch (err) {
      console.error("Failed to inject sidebar:", err);
    }
  }

  console.log('\n✨ Vertical Generation Complete!');
  rl.close();
}

main().catch(console.error);
