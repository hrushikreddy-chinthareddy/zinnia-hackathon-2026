#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const patterns = ['.next', 'node_modules', 'dist', '.turbo', 'build'];

async function findDirectories(
  dir,
  targetName,
  maxDepth = 3,
  currentDepth = 0
) {
  if (currentDepth >= maxDepth) {
    return [];
  }

  const results = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      // If this matches our target, add it
      if (entry.name === targetName) {
        results.push(fullPath);
        // Don't recurse into matched directories
        continue;
      }

      // Skip node_modules when searching for other patterns
      if (entry.name === 'node_modules' && targetName !== 'node_modules') {
        continue;
      }

      // Recurse into subdirectories
      const subResults = await findDirectories(
        fullPath,
        targetName,
        maxDepth,
        currentDepth + 1
      );
      results.push(...subResults);
    }
  } catch (error) {
    // Ignore permission errors and continue
    if (error.code !== 'EACCES' && error.code !== 'EPERM') {
      throw error;
    }
  }

  return results;
}

async function clean() {
  const startTime = performance.now();
  console.log('🧹 Cleaning build artifacts and dependencies...\n');

  // Find and delete all patterns in parallel
  await Promise.all(
    patterns.map(async (pattern) => {
      const matches = await findDirectories(rootDir, pattern);

      if (matches.length > 0) {
        console.log(
          `Removing ${matches.length} ${pattern} director${matches.length === 1 ? 'y' : 'ies'}...`
        );
        await Promise.all(
          matches.map((match) => fs.rm(match, { recursive: true, force: true }))
        );
      }
    })
  );

  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log('\n✅ Clean complete!');
  console.log(`⏱️  Total time: ${duration}s`);
}

clean().catch((error) => {
  console.error('❌ Clean failed:', error);
  process.exit(1);
});
