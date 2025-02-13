import { dirname, join } from 'path';
import type { StorybookConfig } from '@storybook/nextjs';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-a11y'),
    '@chromatic-com/storybook',
  ],

  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },

  staticDirs: ['../public', '../src/app/styles', './assets'],

  docs: {},

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
      const svgRegex = /\.svg$/;
      // disable whatever is already set to load SVGs
      config.module.rules.find(rule => {
        // make sure rule is a RuleSetRule
        // since this type is not exported from webpack gotta eliminate other types
        // we only want rules that have a test prop
        if (!rule || rule === '...' || !rule.test) return;
        const { test } = rule;
        if (test instanceof RegExp && !test.test('.svg')) return;
        if (typeof test === 'string' && !svgRegex.test(test)) return;
        if (test instanceof Function && !test('.svg')) return;
        return (rule.exclude = svgRegex);
      });

      // add SVGR instead
      config.module.rules.push({
        test: svgRegex,
        enforce: 'pre',
        loader: require.resolve('@svgr/webpack'),
      });
    }
    return config;
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
