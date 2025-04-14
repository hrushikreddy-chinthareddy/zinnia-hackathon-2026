import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import onlyWarn from "eslint-plugin-only-warn";
import reactRefresh from "eslint-plugin-react-refresh";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
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

export default defineConfig(
    [globalIgnores(["**/.*.js", "**/*.cjs", "**/node_modules/", "**/dist/"]), {
        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "prettier",
            "plugin:@typescript-eslint/recommended",
            "plugin:react-hooks/recommended",
            "plugin:storybook/recommended",
            "eslint-config-turbo",
        )),

        plugins: {
            "only-warn": onlyWarn,
            "react-refresh": reactRefresh,
            "@typescript-eslint": fixupPluginRules(typescriptEslint),
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

        rules: {
            "react-refresh/only-export-components": ["warn", {
                allowConstantExport: true,
            }],

            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "error",
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