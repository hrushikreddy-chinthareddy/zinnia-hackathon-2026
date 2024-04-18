// vite.config.ts
import path, { resolve } from "path";
import { defineConfig } from "file:///Users/brianbyers/Projects/digital-experience-monorepo/node_modules/.pnpm/vite@5.0.12_@types+node@20.11.16/node_modules/vite/dist/node/index.js";
import react from "file:///Users/brianbyers/Projects/digital-experience-monorepo/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@5.0.12/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgr from "file:///Users/brianbyers/Projects/digital-experience-monorepo/node_modules/.pnpm/vite-plugin-svgr@4.2.0_typescript@5.3.3_vite@5.0.12/node_modules/vite-plugin-svgr/dist/index.js";
import dts from "file:///Users/brianbyers/Projects/digital-experience-monorepo/node_modules/.pnpm/vite-plugin-dts@3.7.2_@types+node@20.11.16_typescript@5.3.3_vite@5.0.12/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/brianbyers/Projects/digital-experience-monorepo/packages/bloom";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    svgr({ include: "**/*.svg" }),
    dts({
      exclude: "src/**/*.stories.*",
      rollupTypes: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src/"),
      "@tokens": path.resolve(__vite_injected_original_dirname, "./src/tokens/"),
      "@components": path.resolve(__vite_injected_original_dirname, "./src/components/")
    }
  },
  build: {
    copyPublicDir: false,
    cssCodeSplit: true,
    lib: {
      entry: {
        bloom: resolve(__vite_injected_original_dirname, "src/bloom.tsx"),
        components: resolve(__vite_injected_original_dirname, "src/components/index.ts")
      }
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React"
        }
      }
    },
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYnJpYW5ieWVycy9Qcm9qZWN0cy9kaWdpdGFsLWV4cGVyaWVuY2UtbW9ub3JlcG8vcGFja2FnZXMvYmxvb21cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9icmlhbmJ5ZXJzL1Byb2plY3RzL2RpZ2l0YWwtZXhwZXJpZW5jZS1tb25vcmVwby9wYWNrYWdlcy9ibG9vbS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYnJpYW5ieWVycy9Qcm9qZWN0cy9kaWdpdGFsLWV4cGVyaWVuY2UtbW9ub3JlcG8vcGFja2FnZXMvYmxvb20vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCwgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgc3ZnciBmcm9tIFwidml0ZS1wbHVnaW4tc3ZnclwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHN2Z3IoeyBpbmNsdWRlOiBcIioqLyouc3ZnXCIgfSksXG4gICAgZHRzKHtcbiAgICAgIGV4Y2x1ZGU6IFwic3JjLyoqLyouc3Rvcmllcy4qXCIsXG4gICAgICByb2xsdXBUeXBlczogdHJ1ZSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9cIiksXG4gICAgICBcIkB0b2tlbnNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy90b2tlbnMvXCIpLFxuICAgICAgXCJAY29tcG9uZW50c1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2NvbXBvbmVudHMvXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgY29weVB1YmxpY0RpcjogZmFsc2UsXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHtcbiAgICAgICAgYmxvb206IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9ibG9vbS50c3hcIiksXG4gICAgICAgIGNvbXBvbmVudHM6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9jb21wb25lbnRzL2luZGV4LnRzXCIpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXCJyZWFjdFwiLCBcInJlYWN0L2pzeC1ydW50aW1lXCJdLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogXCJSZWFjdFwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlZLE9BQU8sUUFBUSxlQUFlO0FBQy9aLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxTQUFTO0FBSmhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLEtBQUssRUFBRSxTQUFTLFdBQVcsQ0FBQztBQUFBLElBQzVCLElBQUk7QUFBQSxNQUNGLFNBQVM7QUFBQSxNQUNULGFBQWE7QUFBQSxJQUNmLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxRQUFRO0FBQUEsTUFDckMsV0FBVyxLQUFLLFFBQVEsa0NBQVcsZUFBZTtBQUFBLE1BQ2xELGVBQWUsS0FBSyxRQUFRLGtDQUFXLG1CQUFtQjtBQUFBLElBQzVEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLElBQ2YsY0FBYztBQUFBLElBQ2QsS0FBSztBQUFBLE1BQ0gsT0FBTztBQUFBLFFBQ0wsT0FBTyxRQUFRLGtDQUFXLGVBQWU7QUFBQSxRQUN6QyxZQUFZLFFBQVEsa0NBQVcseUJBQXlCO0FBQUEsTUFDMUQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsU0FBUyxtQkFBbUI7QUFBQSxNQUN2QyxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxhQUFhO0FBQUEsRUFDZjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
