import { CardHeader } from "../../components/card-header/CardHeader";
import { Meta, StoryObj } from "@storybook/react";
import { ProducerType } from "../../types";

const meta: Meta<typeof CardHeader> = {
  title: "Components/CardHeader",
  component: CardHeader,
  tags: ["autodocs"],
  argTypes: {
    id: { control: "text" },
    producerType: { control: "select", options: ["corporation", "individual"] },
  },
  args: {
    id: "123456789",
  }
};

export default meta;
type Story = StoryObj<typeof CardHeader>;

export const Individual: Story = {
  args: {
    producerType: ProducerType.INDIVIDUAL
  },
};

export const Corporation: Story = {
  args: {
    producerType: ProducerType.CORPORATION
  },
};