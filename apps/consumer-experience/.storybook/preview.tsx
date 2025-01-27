import React from 'react';
import type { Decorator, Preview } from '@storybook/react';
// TODO: change theme https://storybook.js.org/docs/configure/theming
import '../src/app/styles/globals.css';

const withTheme: Decorator = (Story, context) => {
  const theme = context.parameters.theme || context.globals.theme || 'bloom';
  return (
    <div data-theme={theme}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Carrier theme for Bloom',
      toolbar: {
        icon: 'paintbrush',
        items: [
          {
            value: 'everly',
            right: (
              <img
                style={{ width: '1em', height: '1em' }}
                src="everly-logo-icon-new-color.svg"
                alt="Everly"
              />
            ),
            title: 'Everly',
          },
          {
            value: 'wellabe',
            right: (
              <img
                style={{ width: '1em', height: '1em' }}
                src="wellabe-logo-icon-color.svg"
                alt="Zinnia"
              />
            ),
            title: 'Wellabe',
          },
          {
            value: 'bloom',
            right: (
              <img
                style={{ width: '1em', height: '1em' }}
                src="zinnia-logo-icon-color.svg"
                alt="Zinnia"
              />
            ),
            title: 'Zinna',
          },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'bloom',
  },
  decorators: [withTheme],
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
