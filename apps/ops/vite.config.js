import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const mediaTypes = [
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'ico',
    'bmp',
    'avif',
    'webp',
];

export default defineConfig({
    resolve: {
        alias: {
            'next/image': '/vitest/stubs/next-image.tsx',
        },
    },
    plugins: [
        react(),
        svgr({
            include: '**/*.svg',
            svgrOptions: {
                exportType: 'named',
                namedExport: 'ReactComponent',
            },
        }),
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
