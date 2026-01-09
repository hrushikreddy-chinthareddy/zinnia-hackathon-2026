/* eslint-disable no-undef */
// @ts-check
const webpackLib = require('webpack');

/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const { i18n } = require('./next-i18next.config');

const nextConfig = {
    reactStrictMode: true,
    i18n,
    typescript: {
        tsconfigPath:
            process.env.NODE_ENV === 'production'
                ? './tsconfig.production.json'
                : './tsconfig.json',
    },
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/storybook-static/:slug*',
                destination: '/api/storybookstatic',
            },
            { source: '/robots.txt', destination: '/api/robots' },
        ];
    },
    async redirects() {
        // In case someone had the old page bookmarked, the links will still work.
        return [
            {
                source: '/case-management',
                destination: '/cases',
                permanent: true,
            },
            {
                source: '/case-management/:id',
                destination: '/cases/:id',
                permanent: true,
            },
            {
                source: '/policies/:id',
                destination: '/policies/:id/policy/policy-details',
                permanent: true,
            },
            {
                source: '/policies/:planCode/:id/transactions/:path*',
                destination: '/policies/:planCode/:id/policy/:path*',
                permanent: true,
            },
            {
                source: '/illustrations',
                destination: '/illustrations/client-cases',
                permanent: true,
            },
        ];
    },
    compiler: {
        emotion: {
            // default is true. It will be disabled when build type is production.
            sourceMap: process.env.NODE_ENV === 'development',

            // default is 'dev-only'.
            autoLabel: 'dev-only', // 'never' | 'dev-only' | 'always',

            // default is '[local]'.
            // Allowed values: `[local]` `[filename]` and `[dirname]`
            // This option only works when autoLabel is set to 'dev-only' or 'always'.
            // It allows you to define the format of the resulting label.
            // The format is defined via string where variable parts are enclosed in square brackets [].
            // For example labelFormat: "my-classname--[local]", where [local] will be replaced with the name of the variable the result is assigned to.
            // labelFormat?: string,

            // default is undefined.
            // This option allows you to tell the compiler what imports it should
            // look at to determine what it should transform so if you re-export
            // Emotion's exports, you can still use transforms.
            // importMap?: {
            //   [packageName]: {
            //     [exportName: string]: {
            //       canonicalImport?: [string, string],
            //       styledBaseImport?: [string, string],
            //     }
            //   }
            // },
        },
    },
    transpilePackages: ['@zinnia/bloom'],
};

module.exports = {
    ...nextConfig,
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            },
            type: 'javascript/auto',
            use: [
                {
                    loader: '@svgr/webpack',
                },
                {
                    loader: 'file-loader',
                    options: {
                        name: 'static/[path][name].[ext]',
                    },
                },
            ],
        });
        if (process.env.NEXT_PUBLIC_BACKEND_URL === 'https://api.zinnia.io') {
            config.plugins.push(
                new webpackLib.IgnorePlugin({
                    resourceRegExp: /jsonschema-mock-service(\/|\\)/, // Matches the folder and its sub-content
                })
            );
        }

        return config;
    },
};
