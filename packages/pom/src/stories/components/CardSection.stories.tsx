import CardSection from '../../components/card-section/CardSection';
import { Meta, StoryObj } from '@storybook/react';
import { Default as AmlTrainingDefault } from '../views/training-education/AmlTraining.stories';
import { Default as ProductTrainingDefault } from '../views/training-education/ProductTraining.stories';
import { Default as StateTrainingDefault } from '../views/training-education/StateTraining.stories';
import AmlTraining from '../../views/training-education/aml-training/AmlTraining';
import ProductTraining from '../../views/training-education/product-training/ProductTraining';
import StateTraining from '../../views/training-education/state-training/StateTraining';

const meta: Meta<typeof CardSection> = {
  title: 'Components/CardSection',
  component: CardSection,
  tags: ['autodocs'],
  args: {
    title: 'Training and Education',
  },
};

export default meta;
type Story = StoryObj<typeof CardSection>;
export const Default: Story = {
  args: {
    title: 'Card-Section Title',
    children: (
      <div>
        <p>
          Card section is a component that is used to group related content.
        </p>
      </div>
    ),
  },
};

export const WithAction: Story = {
  args: {
    title: 'Card-Section Title',
    children: (
      <div>
        <p>
          Adding a callback to the `action` prop will add a button to the
          header!
        </p>
      </div>
    ),
  },
};

export const AmlTrainingSection: Story = {
  args: {
    title: 'AML Training',
    children: <AmlTraining {...AmlTrainingDefault.args} />,
  },
};

export const ProductTrainingSection: Story = {
  args: {
    title: 'Product Training',
    children: <ProductTraining {...ProductTrainingDefault.args} />,
  },
};

export const StateTrainingSection: Story = {
  args: {
    title: 'State Training',
    children: <StateTraining {...StateTrainingDefault.args} />,
  },
};
