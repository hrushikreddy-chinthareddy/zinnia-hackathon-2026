import path, { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import svgr from 'vite-plugin-svgr';
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), libInjectCss(), svgr(), dts({
    exclude: "src/**/*.stories.*"
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
      '@tokens': path.resolve(__dirname, './src/tokens/'),
    },
  },
  build: {
    lib: {
      entry: {
        bloom:  resolve(__dirname, 'src/main.tsx'),
        components: resolve(__dirname, 'src/components.ts')
      },
      name: 'Bloom',
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
  },
});
