import type { StorybookConfig } from '@storybook/nextjs';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public', '../src/app/styles/icons/'],
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.plugins = [
        ...(config.resolve.plugins || []),
        new TsconfigPathsPlugin({
          extensions: config.resolve.extensions,
        }),
      ];
    }

    if (config.module && config.module.rules) {
      // disable whatever is already set to load SVGs
      const fileLoaderRule = config.module.rules.find(
        rule => rule && rule.test && rule.test?.test('.svg')
      );
      fileLoaderRule.exclude = /\.svg$/;

      // add SVGR instead
      config.module.rules.push({
        test: /\.svg$/,
        enforce: 'pre',
        loader: require.resolve('@svgr/webpack'),
      });
    }
    return config;
  },
};
export default config;
