import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const mediaTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'avif'];

export default defineConfig({
    // Replaces next/image with a lightweight stub so tests don't depend on Next.js image optimization
    // which only happens server-side in Next.js
    resolve: {
        alias: {
            'next/image': '/vitest/stubs/next-image.tsx',
        },
    },
    plugins: [
        react(),
        // Transforms SVG imports into named React components (e.g., import { ReactComponent } from './icon.svg')
        svgr({
            include: '**/*.svg',
            svgrOptions: {
                exportType: 'named',
                namedExport: 'ReactComponent',
            },
        }),
        // Resolves path aliases defined in tsconfig.paths.json (e.g., @deps/*, @vitest/*)
        tsconfigPaths({
            projects: ['./tsconfig.paths.json'],
        }),
        /**
         * A custom plugin to convert media files to data URLs for jsdom resources: usable
         */
        {
            name: 'media-to-data-url',
            enforce: 'pre',
            load(id) {
                for (const mediaType of mediaTypes) {
                    if (id.endsWith(`.${mediaType}`)) {
                        const src = readFileSync(id).toString('base64');
                        return `export default "data:image/${mediaType};base64,${src}"`;
                    }
                }
            },
        },
    ],
    test: {
        globals: true,
        // Uses original class names instead of hashed/scoped names, making CSS modules easier to query in tests
        // https://vitest.dev/config/#css-modules-classnamestrategy
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
        ],
    },
});
