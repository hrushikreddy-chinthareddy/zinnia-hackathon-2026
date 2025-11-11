#!/usr/bin/env node

import { execSync } from 'child_process';

const startTime = performance.now();

console.log('🏗️  Starting build...\n');

try {
  execSync('pnpm run update-spec && pnpm run generate-types && tsup --silent', {
    stdio: 'inherit',
    encoding: 'utf-8',
  });

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Build completed successfully!`);
  console.log(`⏱️  Total build time: ${duration}s`);
} catch (error) {
  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.error(`\n❌ Build failed after ${duration}s`);
  process.exit(1);
}
