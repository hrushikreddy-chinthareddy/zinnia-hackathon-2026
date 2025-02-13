import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['@zinnia/api-types'],
  sourcemap: true,
  treeshake: true,
});
