import { defineConfig, globalIgnores } from "eslint/config";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/.*.js", "**/node_modules/", "**/dist/"]), {
    extends: compat.extends("eslint:recommended", "prettier", "eslint-config-turbo"),

    plugins: {
        "only-warn": onlyWarn,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            React: true,
            JSX: true,
        },
    },

    settings: {
        "import/resolver": {
            typescript: {
                project: "/workspaces/digital-experience-monorepo/packages/eslint-config/tsconfig.json",
            },
        },
    },
}, {
    files: ["**/*.js?(x)", "**/*.ts?(x)"],
}]);