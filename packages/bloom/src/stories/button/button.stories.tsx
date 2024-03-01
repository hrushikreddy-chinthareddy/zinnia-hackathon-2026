import type { Meta, StoryObj } from "@storybook/react";

import { Button, ButtonProps } from "../../components/button/Button";
import Tokens from "../../tokens/react";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ["autodocs"],
  args: {
    mode: "primary",
    children: "Click me",
    "aria-label": "click me",
  },
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
};

export default meta;
type StoryType = StoryObj<ButtonProps>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: StoryType = {};

export const Secondary: StoryType = {
  args: {
    mode: "secondary",
  },
};

export const Small: StoryType = {
  args: {
    size: "small",
  },
};

export const Selected: StoryType = {
  args: {
    selected: true,
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
  },
};

const buttonStyles = Object.entries(Tokens.Colors.Colors).filter(([k]) =>
  k.startsWith("button"),
);
const toCSSPropertyCase = (key: string) =>
  `--${
  // split on uppercase letters since we index by camelcase in react tokens
  key
    .split(/(?=[A-Z])/)
    // return all to lowercase so new set can remove dupes
    .map((k) => k.toLocaleLowerCase())
    // join with kebab case like css custom properties should
    .join("-")
  }`;

const buttonTable = (
  <table>
    <thead>
      <tr>
        <td>name</td>
        <td>property</td>
        <td>value</td>
      </tr>
    </thead>
    {buttonStyles.map(([key, value]) => (
      <tbody key={key}>
        <td>{key}</td>
        <td>{toCSSPropertyCase(key)}</td>
        <td>{value}</td>
      </tbody>
    ))}
  </table>
);
export const Theming: StoryType = {
  render: () => {
    return (
      <ul>
        {buttonTable}
        {buttonStyles.map(([key, value]) => (
          <li key={key}>
            title: {key}
            <br></br>
            value: {value}
            <br></br>
            formatted:{" "}
            {`--${[
              ...new Set(
                // split on uppercase letters since we index by camelcase in react tokens
                key
                  .split(/(?=[A-Z])/)
                  // return all to lowercase so new set can remove dupes
                  .map((k) => k.toLocaleLowerCase()),
              ),
            ]
              // join with kebab case like css custom properties should
              .join("-")}`}
          </li>
        ))}
      </ul>
    );
  },
};
