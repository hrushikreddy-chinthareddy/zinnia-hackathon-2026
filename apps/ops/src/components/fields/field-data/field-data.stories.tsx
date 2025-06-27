import { Meta, StoryObj } from '@storybook/react';

import { storybookContainerDecorator } from '@deps/utils/storybook';

import FieldData, { FieldDataProps, FieldDataVariant } from './field-data';

type StoryType = StoryObj<FieldDataProps>;

const meta: Meta<typeof FieldData> = {
    title: 'Components/Fields/FieldData',
    component: FieldData,
    decorators: [storybookContainerDecorator],
    argTypes: {
        variant: {
            options: FieldDataVariant,
            control: { type: 'inline-radio' },
        },
        caption: {
            control: 'text',
        },
        className: {
            control: 'text',
        },
    },
    args: {
        children: 'Really Cool Value',
        label: 'Cooler Label',
        variant: FieldDataVariant.Default,
    },
};

export default meta;

const createStory = (args?: Partial<FieldDataProps>): StoryType => ({ args });

const createVariantStory =
    (variant: FieldDataVariant, props?: Partial<StoryType>) =>
    (args?: Partial<FieldDataProps>) => ({
        ...props,
        ...createStory({
            ...args,
            variant,
        }),
    });

export const Default = createStory();

export const WithTooltip = createStory({
    tooltipBody: 'this is the body',
    tooltipTitle: 'this is the title',
});

export const WithCaption = createStory({
    caption: 'Coolest caption',
});

export const WithCaptionAndTooltip = createStory({
    ...WithCaption.args,
    ...WithTooltip.args,
});

const createLargeStory = createVariantStory(FieldDataVariant.Large);

export const Large: StoryType = createLargeStory();
export const LargeWithCaption: StoryType = createLargeStory(WithCaption.args);
export const LargeWithTooltip: StoryType = createLargeStory(WithTooltip.args);
export const LargeWithCaptionAndTooltip: StoryType = createLargeStory(
    WithCaptionAndTooltip.args
);

const createInformationStory = createVariantStory(
    FieldDataVariant.Information,
    {
        decorators: [
            (Story) => (
                <div className="w-72">
                    <Story />
                </div>
            ),
        ],
    }
);

export const Information: StoryType = createInformationStory();
export const InformationWithCaption: StoryType = createInformationStory(
    WithCaption.args
);
export const InformationWithTooltip: StoryType = createInformationStory(
    WithTooltip.args
);
export const InformationWithCaptionAndTooltip: StoryType =
    createInformationStory(WithCaptionAndTooltip.args);
