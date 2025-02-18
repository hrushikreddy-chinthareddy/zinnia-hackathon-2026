import React from 'react';
import { Preview } from '@storybook/react';

import '../src/styles/globals.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <div id="producer-onboarding-maintenance">
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
