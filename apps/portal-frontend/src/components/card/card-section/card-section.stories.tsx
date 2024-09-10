import { Meta, StoryObj } from '@storybook/react';

import { generateFields } from '@deps/utils/mock/mockPolicyExtrasFields';
import { storybookContainerDecorator } from '@deps/utils/storybook';

import SectionCard, { SectionCardProps } from './card-section';

type StoryType = StoryObj<SectionCardProps>;

const meta: Meta<typeof SectionCard> = {
    title: 'Components/Cards/SectionCard',
    decorators: [storybookContainerDecorator],
    component: SectionCard,
    args: {
        headerContent: <h1>this is a header</h1>,
        footerContent: [
            {
                text: 'Footer Link',
                href: '/',
            },
        ],
        children: generateFields(3, true),
    },
};

export default meta;

export const Default: StoryType = {};
