import { Meta } from '@storybook/react';

import '@deps/styles/styles.css';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import Popover, { PopoverPlacement } from './popover';

const meta: Meta<typeof Popover> = {
    title: 'Components/Popover',
    component: Popover,
    args: {
        children: 'Popover',
        placement: PopoverPlacement.TopLeft,
    },
    decorators: [
        Story => (
            <div className="mt-20">
                <div className="mx-auto block max-w-[20px]">
                    <Story />
                </div>
            </div>
        ),
    ],
    argTypes: {
        placement: {
            options: [PopoverPlacement.BottomLeft, PopoverPlacement.BottomRight, PopoverPlacement.TopLeft, PopoverPlacement.TopRight],
            defaultValue: PopoverPlacement.BottomLeft,
        },
    },
};

export default meta;

export const RegularPopover = {
    args: {
        children: <CircleInfoIcon width={16} height={16} />,
        title: 'PEMDAS',
        body: 'Please excuse my dear aunt sally',
    },
};
