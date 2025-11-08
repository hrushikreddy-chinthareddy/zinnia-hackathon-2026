#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specsDir = path.resolve(__dirname, '../src/specs');
const generatedTypesDir = path.resolve(__dirname, '../src/generated-types');

async function findSpecFiles() {
  let files;
  try {
    files = await fs.readdir(specsDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Specs directory not found: ${specsDir}`);
      console.error(
        '   Please create a "specs" folder and add your API spec files there.'
      );
      process.exit(1);
    }
    throw error;
  }

  const specFiles = files.filter(
    (file) => file.endsWith('.yaml') || file.endsWith('.json')
  );

  return specFiles.map((file) => {
    // Extract service name from filename (without extension)
    // documents.yaml -> documents
    // documents-v3.yaml -> documents-v3
    // sor.updated.json -> sor
    const name = file.replace(/\.(yaml|json)$/, '').replace('.updated', '');

    return {
      name,
      file,
      path: path.join(specsDir, file),
    };
  });
}

async function updatePackageExports(specs) {
  console.log('\n📦 Updating package.json exports and typesVersions...');

  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

  // Build new exports object
  const newExports = {
    '.': {
      import: './dist/index.js',
    },
  };

  // Build new typesVersions object
  const newTypesVersions = {
    '*': {
      '*': ['dist/index.d.ts'],
    },
  };

  // Add export and typeVersion for each spec
  for (const spec of specs) {
    newExports[`./types/${spec.name}`] =
      `./dist/generated-types/${spec.name}/index.js`;
    newTypesVersions['*'][`./types/${spec.name}`] = [
      `dist/generated-types/${spec.name}/index.d.ts`,
    ];
  }

  // Update package.json
  packageJson.exports = newExports;
  packageJson.typesVersions = newTypesVersions;

  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8'
  );

  console.log(
    `✅ Updated exports and typesVersions for ${specs.length} spec${specs.length === 1 ? '' : 's'}`
  );
}

async function generateTypes() {
  console.log('🔍 Discovering API spec files...\n');

  const specs = await findSpecFiles();

  if (specs.length === 0) {
    console.log('⚠️  No API spec files found');
    return;
  }

  console.log(
    `Found ${specs.length} spec file${specs.length === 1 ? '' : 's'}:`
  );
  specs.forEach((spec) => console.log(`  - ${spec.name} (${spec.file})`));
  console.log('');

  // Clean generated types directory
  console.log('🧹 Cleaning generated types directory...');
  try {
    await fs.rm(generatedTypesDir, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, that's fine
  }
  console.log('');

  // Generate types for each spec
  console.log('⚙️  Generating types...\n');

  for (const spec of specs) {
    const outputDir = path.join(generatedTypesDir, spec.name);
    console.log(`  Generating types for ${spec.name}...`);

    try {
      execSync(
        `npx openapi --input ${spec.path} --output ${outputDir} --exportCore false --exportServices false`,
        {
          stdio: ['inherit', 'inherit', 'pipe'], // Suppress stderr warnings
          encoding: 'utf-8',
        }
      );
    } catch (error) {
      console.error(`  ❌ Failed to generate types for ${spec.name}`);
      if (error.stderr) {
        console.error(error.stderr);
      }
      throw error;
    }
  }

  console.log('\n✅ All types generated successfully!');

  // Update package.json exports
  await updatePackageExports(specs);
}

generateTypes().catch((error) => {
  console.error('\n❌ Type generation failed:', error.message);
  process.exit(1);
});
