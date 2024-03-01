import { Meta, StoryObj } from "@storybook/react";

import {
  Tag,
  TagVariant,
} from "../../components/tag";

export default {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
} as Meta<typeof Tag>;

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
