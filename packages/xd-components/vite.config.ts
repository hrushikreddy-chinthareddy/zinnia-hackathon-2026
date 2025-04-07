import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json',
    })
  ],
  build: {
    lib: {
      entry: 'src/components.ts',
      name: '@zinnia/xd-components',
      fileName: 'xd-components',
    },
    rollupOptions: {
      external: ['react', '@zinnia/utils'],
      output: {
        globals: {
          react: 'React',
          '@zinnia/utils': '@zinnia/utils'
        }
      }
    }
  }
})
