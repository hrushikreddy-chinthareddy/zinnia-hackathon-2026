import { Meta, StoryObj } from '@storybook/react';

import { filterTruthyProps } from '@deps/helpers/data-transform.helpers';
import { generateFields } from '@deps/utils/mock/mockPolicyExtrasFields';
import { numberOfFieldsArgTypes } from '@deps/utils/storybook';
import fullConfig from '@deps/utils/styles';

import ResponsiveFlex, { ResponsiveFlexProps } from './responsive-flex';
import {
    HorizontalResizing,
    ItemPadding,
    ItemSpacing,
    LayoutAlignment,
    LayoutDirection,
    VerticalResizing,
} from './responsive-flex.types';

type StoryProps = ResponsiveFlexProps & {
    numberOfFields: number;
    rainbow: boolean;
    width: number;
    height: number;
};

type StoryType = StoryObj<StoryProps>;

const tempItems: JSX.Element[] = [];

const ResponsiveFlexMeta: Meta<StoryProps> = {
    title: 'Components/Layouts/ResponsiveFlex',
    component: ResponsiveFlex,
    decorators: [
        (Story) => (
            <div className="h-[600px] w-full overflow-auto bg-gray-100">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        ...numberOfFieldsArgTypes,
        layoutDirection: {
            control: { type: 'inline-radio' },
            options: LayoutDirection,
        },
        layoutAlignment: {
            control: { type: 'inline-radio' },
            options: LayoutAlignment,
        },
        verticalResizing: {
            control: { type: 'inline-radio' },
            options: VerticalResizing,
        },
        horizontalResizing: {
            control: { type: 'inline-radio' },
            options: HorizontalResizing,
        },
        itemSpacing: {
            control: { type: 'inline-radio' },
            options: ItemSpacing,
        },
        itemPadding: {
            control: { type: 'inline-radio' },
            options: ItemPadding,
        },
        width: {
            control: 'inline-radio',
            options: fullConfig.theme?.width,
            if: {
                arg: 'horizontalResizing',
                eq: HorizontalResizing.Fixed,
            },
        },
        height: {
            control: 'inline-radio',
            options: fullConfig.theme?.height,
            if: {
                arg: 'verticalResizing',
                eq: VerticalResizing.Fixed,
            },
        },
        style: {
            table: {
                disable: true,
            },
        },
        Tag: {
            table: {
                disable: true,
            },
        },
    },
    args: {
        numberOfFields: 2,
        rainbow: true,
        layoutDirection: LayoutDirection.Vertical,
        layoutAlignment: LayoutAlignment.TopLeft,
        verticalResizing: VerticalResizing.Hug,
        horizontalResizing: HorizontalResizing.Hug,
        itemSpacing: ItemSpacing.Medium,
        itemPadding: ItemPadding.Small,
        Tag: 'div',
        className: 'bg-purple-50',
    },

    render: ({
        numberOfFields,
        rainbow,
        height,
        width,
        ...args
    }: StoryProps) => {
        const difference = numberOfFields - tempItems.length;
        difference > 0 &&
            tempItems.push(...generateFields(difference, rainbow));

        return (
            <ResponsiveFlex
                {...args}
                style={{
                    ...filterTruthyProps({
                        width,
                        height,
                    }),
                }}
            >
                {tempItems.slice(0, numberOfFields)}
            </ResponsiveFlex>
        );
    },
};

filterTruthyProps;
export default ResponsiveFlexMeta;
export const Default: StoryType = {};
