import { Meta, StoryObj } from "@storybook/react";

import {
  Tag,
  TagVariant,
} from "../../components/tag";

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
};

export default meta;

export const DefaultTag: StoryObj<typeof Tag> = {
  args: {
    text: "Tag message",
  },
};

export const White = {
  args: {
    variant: TagVariant.White,
    text: "White message",
  },
};

export const Information = {
  args: {
    variant: TagVariant.Information,
    text: "Information message",
  },
};

export const Selected = {
  args: {
    text: "Selected message",
    isSelected: true,
  },
};
