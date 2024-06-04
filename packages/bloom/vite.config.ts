import path, { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    svgr({ include: "**/*.svg" }),
    dts({
      exclude: "src/**/*.stories.*",
      rollupTypes: true,
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      "@tokens": path.resolve(__dirname, "./src/tokens/"),
      "@components": path.resolve(__dirname, "./src/components/"),
    },
  },
  build: {
    copyPublicDir: false,
    cssCodeSplit: true,
    lib: {
      entry: {
        bloom: resolve(__dirname, "src/bloom.tsx"),
        components: resolve(__dirname, "src/components/index.ts"),
      },
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
    emptyOutDir: true,
  },
});
