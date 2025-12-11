#!/usr/bin/env node

import { execSync } from 'child_process';

const startTime = performance.now();

console.log('🏗️  Starting API types build...\n');

try {
  execSync('pnpm run update-api-spec && pnpm run generate-api-types', {
    stdio: 'inherit',
    encoding: 'utf-8',
  });

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`\n✅ API types build completed successfully!`);
  console.log(`⏱️  Total build time: ${duration}s`);
} catch (error) {
  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.error(`\n❌ API types build failed after ${duration}s`);
  process.exit(1);
}
