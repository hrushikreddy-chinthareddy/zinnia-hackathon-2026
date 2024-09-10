import { Meta } from '@storybook/react';

import { ArrowLeft, PaginationArrowProps, ArrowRight } from './arrows';
import '@deps/styles/styles.css';

export default {
    title: 'Components/Pagination/Arrows',
    component: ArrowLeft,
    subcomponents: { ArrowRight },
    decorators: [
        Story => (
            <div className="h-screen w-screen p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof ArrowLeft>;

// Left Arrow
export const LeftArrow = {
    render: (props: PaginationArrowProps) => <ArrowLeft {...props} />,
    onClick: () => console.log('Left Arrow clicked'),
    disabled: false,
};

// Right Arrow
export const RightArrow = {
    render: (props: PaginationArrowProps) => <ArrowRight {...props} />,
    onClick: () => console.log('Right Arrow clicked'),
    disabled: false,
};
