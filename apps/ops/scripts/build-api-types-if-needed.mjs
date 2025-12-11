#!/usr/bin/env node

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generatedTypesDir = path.resolve(
  __dirname,
  '../api-types/generated-types'
);

// Check if generated-types directory exists and has content
if (existsSync(generatedTypesDir)) {
  console.log('✅ API types already exist, skipping generation');
  process.exit(0);
}

console.log('🔨 API types not found, generating...\n');

try {
  execSync('pnpm run build-api-types', {
    stdio: 'inherit',
    encoding: 'utf-8',
  });
} catch (error) {
  console.error('❌ Failed to generate API types');
  process.exit(1);
}
