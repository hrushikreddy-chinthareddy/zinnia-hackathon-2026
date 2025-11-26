#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const dirsToClean = ['api-types/generated-types'];

async function clean() {
  console.log('🧹 Cleaning API types build artifacts...\n');

  for (const dir of dirsToClean) {
    const fullPath = path.join(rootDir, dir);
    try {
      await fs.rm(fullPath, { recursive: true, force: true, maxRetries: 3 });
      console.log(`  ✓ Removed ${dir}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`  ✗ Failed to remove ${dir}:`, error.message);
      }
    }
  }

  console.log('\n✅ Clean complete!');
}

clean().catch(error => {
  console.error('❌ Clean failed:', error);
  process.exit(1);
});
