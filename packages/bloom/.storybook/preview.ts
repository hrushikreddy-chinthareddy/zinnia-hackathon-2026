import type { Preview } from "@storybook/react";
import '../src/tokens/css/index.css'

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Introduction",
          // "Getting Started",
          // "Typography",
          // "Colors",
          // "Icons",
          // "Components",
          // "Layout",
          // "UI",
          // "Forms",
          // "Hooks",
          // "Utils",
        ],
      },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
