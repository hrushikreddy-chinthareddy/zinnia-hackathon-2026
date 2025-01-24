import type { Preview } from '@storybook/react';
// TODO: change theme https://storybook.js.org/docs/configure/theming
import '../src/app/styles/globals.css';

const preview: Preview = {
  parameters: {
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
  tags: ['autodocs'],
};

export default preview;
