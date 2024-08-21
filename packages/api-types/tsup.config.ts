import { defineConfig, type Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entryPoints: [
    'src/index.ts',
    'src/generated-types/sor',
    'src/generated-types/search',
    'src/generated-types/documents',
    'src/generated-types/bpm',
    'src/generated-types/funds',
  ],
  clean: true,
  dts: true,
  format: ['cjs'],
  ...options,
}));
