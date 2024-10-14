import { Meta } from '@storybook/react';

import '@deps/styles/styles.css';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import Tooltip, { PopoverPlacement } from './tooltip';

const meta: Meta<typeof Tooltip> = {
    title: 'Components/Tooltip',
    component: Tooltip,
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
        isTabbable: {
            options: [true, false],
            defaultValue: true,
        },
        placement: {
            options: [PopoverPlacement.BottomLeft, PopoverPlacement.BottomRight, PopoverPlacement.TopLeft, PopoverPlacement.TopRight],
            defaultValue: PopoverPlacement.BottomLeft,
        },
    },
};

export default meta;

export const RegularTooltip = {
    args: {
        children: <CircleInfoIcon width={16} height={16} />,
        body: 'Please excuse my dear aunt sally',
    },
};
