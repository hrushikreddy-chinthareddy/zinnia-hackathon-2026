import { Meta } from "@storybook/react";

import { Icon, IconProps, IconType } from "../../components";

const meta: Meta<typeof Icon> =  {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: {
    type: IconType.CLOUD,
  },
  argTypes: {
    color: {
      control: {
        type: "color",
        default: "#000",
      },
    },
  },
};

export default meta;

export const IconExample = (args: IconProps) => <Icon {...args} />;
