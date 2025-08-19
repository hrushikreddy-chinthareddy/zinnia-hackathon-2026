import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entryPoints: [
    "src/index.ts",
    "src/generated-types/sor",
    "src/generated-types/search",
    "src/generated-types/documents",
    "src/generated-types/documents-v3",
    "src/generated-types/bpm",
    "src/generated-types/funds",
    "src/generated-types/case",
    "src/generated-types/case-v2",
    "src/generated-types/transaction-store",
    "src/generated-types/preferences",
    "src/generated-types/partyreference",
    "src/generated-types/analytics",
    "src/generated-types/contact-management",
  ],
  clean: true,
  dts: true,
  format: ["cjs"],
  ...options,
}));
