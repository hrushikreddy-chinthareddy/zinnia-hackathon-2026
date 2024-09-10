import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import { TagKey } from '@deps/types/components';

import CardPeople from './card-people';

export default {
    title: 'Components/CardPeople',
    component: CardPeople,
    argTypes: {
        name: {
            control: 'text',
        },
        tags: {
            control: 'select',
            options: ['Owner', 'Agent Type', 'Insured', 'Payor', 'Payee'],
        },
        allocation: {
            control: 'text',
        },
    },
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof CardPeople>;

const name = 'Alexandrovsky Ant';
const allocation = 50;
const tags: TagKey[] = [
    {
        text: 'Owner',
    },
    {
        text: 'Agent Type',
    },
];
const multipleTags = [
    {
        text: 'Owner',
    },
    {
        text: 'Agent Type',
    },
    {
        text: 'Insured',
    },
    {
        text: 'Payor',
    },
    {
        text: 'Payee',
    },
];

export const WithoutAllocation = (args: any) => {
    return (
        <div className="flex max-w-[500px] flex-col">
            <CardPeople name={name} tags={tags} {...args} />
        </div>
    );
};

export const WithAllocation = (args: any) => {
    return (
        <div className="flex max-w-[500px] flex-col">
            <CardPeople name={name} tags={tags} allocation={allocation} {...args} />
        </div>
    );
};

export const WithLongName = (args: any) => {
    const longName = 'This is a very long name that should be truncated';
    return (
        <div className="flex max-w-[500px] flex-col">
            <CardPeople name={longName} tags={tags} allocation={allocation} {...args} />
        </div>
    );
};

export const WithMultipleTags = (args: any) => {
    return (
        <div className="flex max-w-[500px] flex-col">
            <CardPeople name={name} tags={multipleTags} allocation={allocation} {...args} />
        </div>
    );
};

export const WithLongNameAndMultipleTags = (args: any) => {
    const longName = 'This is a very long name that should be truncated';
    return (
        <div className="flex max-w-[500px] flex-col">
            <CardPeople name={longName} tags={multipleTags} allocation={allocation} {...args} />
        </div>
    );
};

export const SelectedTags = (args: any) => {
    return (
        <div className="flex max-w-[500px] flex-col">
            <CardPeople name={name} tags={multipleTags} selectedTags={['owner', 'payor']} allocation={allocation} {...args} />
        </div>
    );
};
