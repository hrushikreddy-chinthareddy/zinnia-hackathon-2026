import path, { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import svgr from "vite-plugin-svgr";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    svgr(),
    dts({
      exclude: "src/**/*.stories.*",
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
      "@tokens": path.resolve(__dirname, "./src/tokens/"),
      "@components": path.resolve(__dirname, "./src/components/"),
    },
  },
  build: {
    copyPublicDir: false,
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
