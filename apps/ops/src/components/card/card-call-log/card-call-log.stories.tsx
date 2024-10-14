import { Meta, StoryObj } from '@storybook/react';

import { storybookContainerDecorator } from '@deps/utils/storybook';
import '@deps/styles/styles.css';

import CallLogCard, { CallLogCardProps } from './card-call-log';

const meta: Meta<typeof CallLogCard> = {
    title: 'Components/Cards/CallLogCard',
    component: CallLogCard,
    decorators: [storybookContainerDecorator, Story => (
        <div className="w-[500px]">
            <Story />
        </div>
    )],
    args: {
        callerName: 'John Smith',
        callerRole: 'Representative',
        tag: 'New Business',
        summary:
            'The call was about updating an address for a client. The caller provided the contract number and the name on the contract. They also mentioned their relationship to the contract as a branch office administrator. Chupa chups chupa chups lollipop dragée icing cupcake lemon drops. Cake liquorice art liquorice pastry pastry dessert carrot cake toffee shortbread. Croissant cotton candy lemon drops fruitcake caramels cheesecake. ',
        createdAt: '2023-11-12T08:02:17',
    },
    argTypes: {
        callerName: {
            control: 'text',
        },
        callerRole: {
            control: 'text',
        },
        tag: {
            control: 'text',
        },
        createdAt: {
            control: 'text',
        },
        summary: {
            control: 'text',
        },
    },
};

export default meta;

type StoryType = StoryObj<CallLogCardProps>

export const Default: StoryType = {};
