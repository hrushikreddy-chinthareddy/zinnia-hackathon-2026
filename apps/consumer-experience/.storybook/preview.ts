import type { Preview } from '@storybook/react';
// TODO: change theme https://storybook.js.org/docs/configure/theming
import '../src/app/styles/everly/theme.css';
import '@zinnia/bloom';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'standard',
      values: [
        {
          name: 'standard',
          value: '#EDEDED',
        },
      ],
    },
  },
};

export default preview;
