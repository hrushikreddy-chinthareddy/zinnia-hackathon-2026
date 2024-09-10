const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const config = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-a11y',
        {
            name: '@storybook/addon-styling',
            options: {
                postCss: {
                    implementation: require('postcss'),
                },
            },
        },
    ],
    framework: {
        name: '@storybook/nextjs',
        options: {},
    },
    core: {},
    staticDirs: ['../public'],
    docs: {
        autodocs: 'tag',
    },
    webpackFinal: async config => {
        // configure for absolute imports
        config.resolve.plugins = [
            ...(config.resolve.plugins || []),
            new TsconfigPathsPlugin({
                extensions: config.resolve.extensions,
            }),
        ];
        config.resolve.fallback.fs = false;

        // disable whatever is already set to load SVGs
        config.module.rules.filter(rule => rule.test?.test('.svg')).forEach(rule => (rule.exclude = /\.svg$/i));

        // add SVGR instead
        config.module.rules.push({
            test: /\.svg$/,
            use: [
                {
                    loader: '@svgr/webpack',
                },
                {
                    loader: 'file-loader',
                    options: {
                        name: 'static/media/[path][name].[ext]',
                    },
                },
            ],
            type: 'javascript/auto',
            issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            },
        });
        return config;
    },
};
export default config;
