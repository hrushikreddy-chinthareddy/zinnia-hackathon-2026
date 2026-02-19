import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Stub SVG imports with both default (URL string) and named (ReactComponent) exports
function svgStubPlugin() {
    return {
        name: 'svg-stub',
        enforce: 'pre',
        load(id) {
            if (/\.svg(\?.*)?$/.test(id)) {
                const cleanId = id.replace(/\?.*$/, '');
                return `
                    import { forwardRef, createElement } from 'react';
                    const ReactComponent = forwardRef((props, ref) =>
                        createElement('svg', { ...props, ref, 'data-testid': 'svg-stub' })
                    );
                    export { ReactComponent };
                    export default "${cleanId}";
                `;
            }
        },
    };
}

export default defineConfig({
    plugins: [
        react(),
        svgStubPlugin(),
        tsconfigPaths({
            projects: ['./tsconfig.paths.json'],
        }),
    ],
    test: {
        globals: true,
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
        projects: [
            {
                extends: true,
                test: {
                    globals: true,

                    name: 'node',
                    include: ['**/*.vitest.node.{test,spec}.{ts,tsx}'],
                    environment: 'jsdom',
                    setupFiles: ['./vitest/vitest.setup.ts'],
                },
            },
            // {
            //     extends: true,
            //     test: {
            //         name: 'browser',
            //         include: ['**/*.vitest.browser.{test,spec}.{ts,tsx}'],
            //         browser: {
            //             enabled: true,
            //             provider: playwright(),
            //             instances: [{ browser: 'chromium' }],
            //         },
            //     },
            // },
        ],
    },
});
