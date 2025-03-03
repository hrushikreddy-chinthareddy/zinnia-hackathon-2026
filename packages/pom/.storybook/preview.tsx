import { Preview } from '@storybook/react';

import '../src/styles/globals.css';
import BaseStorybookLayout from '../src/stories/decorators/StorybookDecorator';

const preview: Preview = {
  decorators: BaseStorybookLayout,
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
