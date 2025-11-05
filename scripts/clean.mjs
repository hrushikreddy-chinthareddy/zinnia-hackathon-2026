#!/usr/bin/env node

import { rimraf } from 'rimraf';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const patterns = ['.next', 'node_modules', 'dist', '.turbo'];

async function clean() {
  console.log('🧹 Cleaning build artifacts and dependencies...\n');

  for (const pattern of patterns) {
    // For node_modules, don't ignore nested ones since we want to delete all of them
    const ignorePattern = pattern === 'node_modules' ? [] : ['**/node_modules/**'];
    
    const matches = await glob(`**/${pattern}`, {
      cwd: rootDir,
      ignore: ignorePattern,
      absolute: true,
      maxDepth: 3, // Limit depth to avoid excessive scanning
    });

    if (matches.length > 0) {
      console.log(`Removing ${matches.length} ${pattern} director${matches.length === 1 ? 'y' : 'ies'}...`);
      await Promise.all(matches.map((match) => rimraf(match)));
    }
  }

  console.log('\n✅ Clean complete!');
}

clean().catch((error) => {
  console.error('❌ Clean failed:', error);
  process.exit(1);
});
