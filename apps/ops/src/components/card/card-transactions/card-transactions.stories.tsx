import { Meta, StoryObj } from '@storybook/react';

import { generateAdditionalCharges } from '@deps/utils/mock/mockPolicyValues';
import {
    numberOfFieldsArgTypes,
    storybookContainerDecorator,
} from '@deps/utils/storybook';

import CardTransactions, { CardTransactionsProps } from './card-transactions';

type StoryProps = CardTransactionsProps & {
    numberOfFields: number;
};

type StoryType = StoryObj<StoryProps>;

const meta: Meta<StoryProps> = {
    title: 'Components/Cards/CardTransactions',
    component: CardTransactions,
    decorators: [storybookContainerDecorator],
    args: {
        numberOfFields: 8,
        title: 'Monthly Premium',
        additionalChargesTitle: 'Additional Charges',
        premium: 400,
    },
    argTypes: {
        ...numberOfFieldsArgTypes,
    },
    render: ({ numberOfFields, ...props }: StoryProps) => (
        <CardTransactions
            {...props}
            additionalCharges={generateAdditionalCharges(numberOfFields)}
        />
    ),
};

export default meta;

export const Default: StoryType = {};

export const NoAdditionalCharges = {
    args: {
        numberOfFields: 0,
    },
};
