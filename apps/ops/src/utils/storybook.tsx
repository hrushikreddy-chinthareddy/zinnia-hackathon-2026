import { Decorator } from '@storybook/react';

import { PopoverPlacement } from '@deps/components/popover/popover';
import { ReactComponent as Calendar } from '@deps/styles/elements/icons/icons_outlined/calendar.svg';
import { ReactComponent as Camera } from '@deps/styles/elements/icons/icons_outlined/camera.svg';
import { ReactComponent as Yen } from '@deps/styles/elements/icons/icons_outlined/currency-yen.svg';
import { ReactComponent as SparklesIcon } from '@deps/styles/elements/icons/icons_outlined/sparkles.svg';

const icons = {
    Sparkles: <SparklesIcon className="text-primary" width={20} height={20} />,
    Yen: <Yen className="text-primary" width={20} height={20} />,
    Calendar: <Calendar className="text-primary" width={20} height={20} />,
    Camera: <Camera className="text-primary" width={20} height={20} />,
    NoIcon: null,
};

export const iconArgTypes = {
    icon: {
        options: Object.keys(icons),
        mapping: icons,
        control: {
            type: 'select',
            labels: {
                NoIcon: 'No Icon',
            },
        },
    },
};

export const tooltipPlacementArgTypes = {
    tooltipPlacement: {
        options: PopoverPlacement,
        control: {
            type: 'radio',
        },
    },
};

export const numberOfFieldsArgTypes = {
    numberOfFields: {
        control: {
            type: 'range',
            min: 1,
            max: 128,
        },
    },
};

export const storybookContainerDecorator: Decorator = (Story) => (
    <div className="flex justify-center bg-gray-100 p-8">
        <div className="bg-white p-1">
            <Story />
        </div>
    </div>
);

/**
 * Storybook utility function to emulate pausing between interactions
 * @param ms - milliseconds to sleep
 * @returns a promise that resolves after `ms` milliseconds
 */
export const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
