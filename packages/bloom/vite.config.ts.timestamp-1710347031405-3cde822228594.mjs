// vite.config.ts
import path, { resolve } from "path";
import { defineConfig } from "file:///Users/roccosangellino/Projects/digital-experience-monorepo/node_modules/.pnpm/vite@5.0.12_@types+node@20.11.16/node_modules/vite/dist/node/index.js";
import react from "file:///Users/roccosangellino/Projects/digital-experience-monorepo/node_modules/.pnpm/@vitejs+plugin-react@4.2.1_vite@5.0.12/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { libInjectCss } from "file:///Users/roccosangellino/Projects/digital-experience-monorepo/node_modules/.pnpm/vite-plugin-lib-inject-css@1.3.0_vite@5.0.12/node_modules/vite-plugin-lib-inject-css/dist/index.mjs";
import svgr from "file:///Users/roccosangellino/Projects/digital-experience-monorepo/node_modules/.pnpm/vite-plugin-svgr@4.2.0_typescript@5.3.3_vite@5.0.12/node_modules/vite-plugin-svgr/dist/index.js";
import dts from "file:///Users/roccosangellino/Projects/digital-experience-monorepo/node_modules/.pnpm/vite-plugin-dts@3.7.2_@types+node@20.11.16_typescript@5.3.3_vite@5.0.12/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/roccosangellino/Projects/digital-experience-monorepo/packages/bloom";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    libInjectCss(),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcm9jY29zYW5nZWxsaW5vL1Byb2plY3RzL2RpZ2l0YWwtZXhwZXJpZW5jZS1tb25vcmVwby9wYWNrYWdlcy9ibG9vbVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3JvY2Nvc2FuZ2VsbGluby9Qcm9qZWN0cy9kaWdpdGFsLWV4cGVyaWVuY2UtbW9ub3JlcG8vcGFja2FnZXMvYmxvb20vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3JvY2Nvc2FuZ2VsbGluby9Qcm9qZWN0cy9kaWdpdGFsLWV4cGVyaWVuY2UtbW9ub3JlcG8vcGFja2FnZXMvYmxvb20vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCwgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgeyBsaWJJbmplY3RDc3MgfSBmcm9tIFwidml0ZS1wbHVnaW4tbGliLWluamVjdC1jc3NcIjtcbmltcG9ydCBzdmdyIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbGliSW5qZWN0Q3NzKCksXG4gICAgc3Zncih7IGluY2x1ZGU6IFwiKiovKi5zdmdcIiB9KSxcbiAgICBkdHMoe1xuICAgICAgZXhjbHVkZTogXCJzcmMvKiovKi5zdG9yaWVzLipcIixcbiAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL1wiKSxcbiAgICAgIFwiQHRva2Vuc1wiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL3Rva2Vucy9cIiksXG4gICAgICBcIkBjb21wb25lbnRzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvY29tcG9uZW50cy9cIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjb3B5UHVibGljRGlyOiBmYWxzZSxcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiB7XG4gICAgICAgIGJsb29tOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvYmxvb20udHN4XCIpLFxuICAgICAgICBjb21wb25lbnRzOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvY29tcG9uZW50cy9pbmRleC50c1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1wicmVhY3RcIiwgXCJyZWFjdC9qc3gtcnVudGltZVwiXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgcmVhY3Q6IFwiUmVhY3RcIixcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnWixPQUFPLFFBQVEsZUFBZTtBQUM5YSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sU0FBUztBQUxoQixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQUEsSUFDYixLQUFLLEVBQUUsU0FBUyxXQUFXLENBQUM7QUFBQSxJQUM1QixJQUFJO0FBQUEsTUFDRixTQUFTO0FBQUEsTUFDVCxhQUFhO0FBQUEsSUFDZixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsUUFBUTtBQUFBLE1BQ3JDLFdBQVcsS0FBSyxRQUFRLGtDQUFXLGVBQWU7QUFBQSxNQUNsRCxlQUFlLEtBQUssUUFBUSxrQ0FBVyxtQkFBbUI7QUFBQSxJQUM1RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxJQUNmLEtBQUs7QUFBQSxNQUNILE9BQU87QUFBQSxRQUNMLE9BQU8sUUFBUSxrQ0FBVyxlQUFlO0FBQUEsUUFDekMsWUFBWSxRQUFRLGtDQUFXLHlCQUF5QjtBQUFBLE1BQzFEO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFNBQVMsbUJBQW1CO0FBQUEsTUFDdkMsUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1AsT0FBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsYUFBYTtBQUFBLEVBQ2Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
