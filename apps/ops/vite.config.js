import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

// Custom plugin to stub SVG imports with both default (URL string) and named (ReactComponent) exports
function svgStubPlugin() {
    return {
        name: 'svg-stub',
        enforce: 'pre',
        load(id) {
            if (id.endsWith('.svg')) {
                return `
                    import { forwardRef, createElement } from 'react';
                    const ReactComponent = forwardRef((props, ref) =>
                        createElement('svg', { ...props, ref, 'data-testid': 'svg-stub' })
                    );
                    export { ReactComponent };
                    export default "${id}";
                `;
            }
        },
    };
}

const stubDir = (p) => fileURLToPath(new URL(p, import.meta.url));

const alias = [
    // Path aliases from tsconfig
    { find: '@deps', replacement: stubDir('./src') },
    {
        find: '@zinnia/api-types/types',
        replacement: stubDir('./api-types/generated-types'),
    },
    {
        find: /^api-types\/generated-types\/(.*)$/,
        replacement: stubDir('./api-types/generated-types') + '/$1',
    },
    {
        find: /^components\/(.*)$/,
        replacement: stubDir('./src/components') + '/$1',
    },
    { find: /^models\/(.*)$/, replacement: stubDir('./src/models') + '/$1' },
    { find: /^utils\/(.*)$/, replacement: stubDir('./src/utils') + '/$1' },
    { find: /^queries\/(.*)$/, replacement: stubDir('./src/queries') + '/$1' },
];

const extensions = ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'];

export default defineConfig({
    plugins: [react(), svgStubPlugin()],
    resolve: { alias, extensions },
    test: {
        globals: true,
        include: ['**/*.vitest.node.{test,spec}.{ts,tsx}'],
        environment: 'jsdom',
        setupFiles: ['./vitest/setup.ts'],
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
    },
});
