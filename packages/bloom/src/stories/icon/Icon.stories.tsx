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
    type: {
      options: Object.values(IconType)
    },
    color: {
      control: {
        type: "color",
        default: "#000",
      },
    },
  },
};

console.log({
  icontType: Object.values(IconType)
})

export default meta;

export const IconExample = (args: IconProps) => <Icon {...args} />;
