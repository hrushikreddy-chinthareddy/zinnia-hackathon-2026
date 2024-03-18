import { Meta, StoryObj } from "@storybook/react";

import { ChipX, ChipXProps } from "../../components/chip-x";

const meta: Meta<typeof ChipX> = {
  title: "Components/ChipX",
  component: ChipX,
  tags: ["autodocs"],
  args: {
    label: "Chip",
    onDelete: () => {
      console.log("Deleting chip");
    },
  },
};

export default meta;

type StoryType = StoryObj<ChipXProps>;

export const Default: StoryType = {};
