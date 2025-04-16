import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import onlyWarn from "eslint-plugin-only-warn";
import checkFile from "eslint-plugin-check-file";
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

export default defineConfig([
    globalIgnores(["**/.*.js", "**/node_modules/", "**/next-env.d.ts"]),
    ...storybook.configs['flat/recommended'],
    {
        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "plugin:import/recommended",
            "plugin:storybook/recommended",
            "prettier",
            "turbo",
        )),

        plugins: {
            "only-warn": onlyWarn,
            "check-file": checkFile,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
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

        rules: {
            "check-file/no-index": "error",

            "check-file/filename-blocklist": ["error", {
                "**/*.model.ts": "*.models.ts",
                "**/*.util.ts": "*.utils.ts",
                "**/*.helper.ts": "*.helpers.ts",
            }],

            "check-file/folder-match-with-fex": ["error", {
                "*.test.{js,jsx,ts,tsx}": "**/__tests__/",
            }],

            "check-file/filename-naming-convention": ["error", {
                "**/*.{jsx,tsx}": "PASCAL_CASE",
                "**/*.{js,ts}": "CAMEL_CASE",
            }],

            "check-file/folder-naming-convention": ["error", {
                "src/components/*/": "PASCAL_CASE",
                "src/!(components)/**/!(__tests__)/": "CAMEL_CASE",
            }],
        },
    },
    {
        files: ["**/*.js?(x)", "**/*.ts?(x)"],
    },
    {
        files: ['*.js?(x)', '*.ts?(x)'],
        rules: {
            'storybook/hierarchy-separator': 'off',
            'storybook/default-exports': 'off',
            'storybook/story-exports': 'off',
        }
    },
    {
        files: ['src/**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
        rules: {
            'storybook/hierarchy-separator': 'error',
            'storybook/default-exports': 'error',
            'storybook/story-exports': 'error',
        }
    }
],
);