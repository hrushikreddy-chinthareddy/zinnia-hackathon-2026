import { Meta } from '@storybook/react';

import FilterButton, { FilterButtonProps } from './filter-button';
import '@deps/styles/styles.css';

export default {
    title: 'Components/FilterButton',
    component: FilterButton,
    decorators: [
        (Story) => (
            <div className="h-screen w-screen p-10">
                <div
                    style={{
                        width: '90px',
                    }}
                >
                    <Story />
                </div>
            </div>
        ),
    ],
    argTypes: {
        selected: {
            control: 'boolean',
        },
    },
} as Meta<typeof FilterButton>;

export const FilterButtonComponent = (args: FilterButtonProps) => (
    <FilterButton {...args} />
);
FilterButtonComponent.args = {
    selected: true,
};
