import { Meta, StoryObj } from "@storybook/react";

import {
  Loader,
  LoaderVariant
} from "../../components/loader";


const meta: Meta<typeof Loader> = {
  title: "Components/Loader",
  component: Loader,
  tags: ["autodocs"],
}

export default meta;

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