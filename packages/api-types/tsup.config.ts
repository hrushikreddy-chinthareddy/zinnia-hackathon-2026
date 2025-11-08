import { defineConfig, type Options } from 'tsup';
import { readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getGeneratedTypeEntries() {
  const generatedTypesDir = join(__dirname, 'src/generated-types');
  
  if (!existsSync(generatedTypesDir)) {
    return [];
  }
  
  const entries = readdirSync(generatedTypesDir, { withFileTypes: true });
  
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => `src/generated-types/${entry.name}`);
}

export default defineConfig((options: Options) => ({
  entryPoints: [
    'src/index.ts',
    ...getGeneratedTypeEntries(),
  ],
  clean: true,
  dts: true,
  format: ['cjs'],
  ...options,
}));
