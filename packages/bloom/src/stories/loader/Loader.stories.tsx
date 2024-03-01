import { Meta, StoryObj } from "@storybook/react";

import {
  Loader,
  LoaderVariant
} from "../../components/loader";


export default {
  title: "Components/Loader",
  component: Loader,
  tags: ["autodocs"],
} as Meta<typeof Loader>;

export const DefaultLoader: StoryObj<typeof Loader> = {
  args: {
    hide: false,
  },
};

export const CTA = {
  args: {
    hide: false,
    variant: LoaderVariant.CTA,
  },
};