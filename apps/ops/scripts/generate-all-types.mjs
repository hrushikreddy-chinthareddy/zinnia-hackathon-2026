#!/usr/bin/env node

import { exec } from 'child_process';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const specsDir = path.resolve(__dirname, '../api-types/specs');
const generatedTypesDir = path.resolve(
  __dirname,
  '../api-types/generated-types'
);

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
    file =>
      (file.endsWith('.yaml') || file.endsWith('.json')) &&
      !file.endsWith('.updated.json')
  );

  return specFiles.map(file => {
    // Extract service name from filename (without extension)
    // documents.yaml -> documents
    // documents-v3.yaml -> documents-v3
    // sor.updated.json -> sor
    const name = file.replace(/\.(yaml|json)$/, '').replace('.updated', '');

    // Use preprocessed version if it exists
    let specPath = path.join(specsDir, file);
    const updatedFile = file
      .replace('.json', '.updated.json')
      .replace('.yaml', '.updated.yaml');
    const updatedPath = path.join(specsDir, updatedFile);

    if (existsSync(updatedPath)) {
      specPath = updatedPath;
    }

    return {
      name,
      file,
      path: specPath,
    };
  });
}

async function generateTypes() {
  const startTime = performance.now();
  console.log('🔍 Discovering API spec files...\n');

  const specs = await findSpecFiles();

  if (specs.length === 0) {
    console.log('⚠️  No API spec files found');
    return;
  }

  console.log(
    `Found ${specs.length} spec file${specs.length === 1 ? '' : 's'}:`
  );
  specs.forEach(spec => console.log(`  - ${spec.name} (${spec.file})`));
  console.log('');

  // Clean generated types directory
  console.log('🧹 Cleaning generated types directory...');
  try {
    await fs.rm(generatedTypesDir, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, that's fine
  }
  console.log('');

  // Generate types for each spec SEQUENTIALLY to avoid race conditions
  // See: openapi-typescript-codegen@0.26.0 has race condition bugs when generating in parallel
  console.log('⚙️  Generating types sequentially...\n');

  for (const spec of specs) {
    const outputDir = path.join(generatedTypesDir, spec.name);
    console.log(`  Generating types for ${spec.name}...`);

    try {
      await execAsync(
        `npx openapi --input "${spec.path}" --output "${outputDir}" --exportCore false --exportServices false`
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

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`\n⏱️  Total generation time: ${duration}s`);
}

generateTypes().catch(error => {
  console.error('\n❌ Type generation failed:', error.message);
  process.exit(1);
});
