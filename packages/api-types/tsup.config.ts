import { defineConfig, type Options } from 'tsup';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

function getGeneratedTypeEntries() {
  const generatedTypesDir = join(process.cwd(), 'src/generated-types');

  if (!existsSync(generatedTypesDir)) {
    return [];
  }

  const entries = readdirSync(generatedTypesDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => `src/generated-types/${entry.name}`);
}

export default defineConfig((options: Options) => ({
  entryPoints: ['src/index.ts', ...getGeneratedTypeEntries()],
  clean: true,
  dts: true,
  format: ['cjs'],
  splitting: false,
  treeshake: false,
  minify: false,
  sourcemap: false,
  target: 'node20',
  skipNodeModulesBundle: true,
  ...options,
}));
