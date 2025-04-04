import clsx from 'clsx';
import { ElementType, ReactNode } from 'react';

import Label, { LabelProps, LabelVariant } from '@deps/components/label/label';
import ResponsiveFlex, { ResponsiveFlexProps } from '@deps/components/responsive-flex/responsive-flex';
import {
    LayoutDirection,
    LayoutAlignment,
    HorizontalResizing,
    VerticalResizing,
    ItemSpacing,
} from '@deps/components/responsive-flex/responsive-flex.types';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { filterTruthyProps } from '@deps/helpers/data-transform.helper';

export enum FieldDataTest {
    Container = 'field-data-container-test-id',
    Label = 'field-data-label-test-id',
    Value = 'field-data-value-test-id',
    Caption = 'field-data-caption-test-id',
}

export enum FieldDataVariant {
    Large = 'Large',
    Default = 'Default',
    Information = 'Information',
}

export type FieldDataProps = {
    caption?: ReactNode;
    editable?: boolean;
    label: string;
    variant?: FieldDataVariant;
    captionTag?: ElementType;
    labelClassName?: string;
} & Omit<LabelProps, 'variant'>;

type FieldDataMappingProps = Partial<ResponsiveFlexProps> & {
    typography?: TypographyVariant | LabelVariant;
};

enum FieldDataElements {
    container = 'container',
    label = 'label',
    value = 'value',
    caption = 'caption',
}

const defaultConfig: Record<FieldDataElements, FieldDataMappingProps> = {
    container: {
        layoutDirection: LayoutDirection.Vertical,
        layoutAlignment: LayoutAlignment.TopLeft,
        horizontalResizing: HorizontalResizing.Hug,
        itemSpacing: ItemSpacing.None,
    },
    label: {
        verticalResizing: VerticalResizing.Fixed,
        horizontalResizing: HorizontalResizing.Hug,
        layoutAlignment: LayoutAlignment.MiddleLeft,
        typography: LabelVariant.FieldLabel,
        className: 'min-h-[24px]',
    },
    value: {
        layoutAlignment: LayoutAlignment.MiddleLeft,
        horizontalResizing: HorizontalResizing.Fill,
        verticalResizing: VerticalResizing.Hug,
        typography: TypographyVariant.BodySm,
        className: 'py-0.5',
    },
    caption: {
        layoutDirection: LayoutDirection.Vertical,
        layoutAlignment: LayoutAlignment.TopLeft,
        horizontalResizing: HorizontalResizing.Hug,
        typography: TypographyVariant.BodySm,
        className: 'text-gray-600',
    },
};

const fieldDataMapping: Record<
    FieldDataVariant,
    {
        container: FieldDataMappingProps;
        label: FieldDataMappingProps;
        value: FieldDataMappingProps;
        caption: FieldDataMappingProps;
    }
> = {
    [FieldDataVariant.Default]: defaultConfig,
    [FieldDataVariant.Large]: {
        ...defaultConfig,
        value: {
            ...defaultConfig.value,
            typography: TypographyVariant.Value,
            className: 'py-0.5',
        },
    },
    [FieldDataVariant.Information]: {
        ...defaultConfig,
        container: {
            ...defaultConfig.container,
            layoutDirection: LayoutDirection.Horizontal,
            horizontalResizing: HorizontalResizing.Fill,
            verticalResizing: VerticalResizing.Hug,
            layoutAlignment: LayoutAlignment.MiddleEvenly,
            className: 'flex-wrap',
        },
        value: {
            ...defaultConfig.value,
            layoutAlignment: LayoutAlignment.Middle,
            horizontalResizing: HorizontalResizing.Hug,
            verticalResizing: VerticalResizing.Hug,
        },
        label: {
            ...defaultConfig.label,
            layoutAlignment: LayoutAlignment.Middle,
            horizontalResizing: HorizontalResizing.Hug,
            verticalResizing: VerticalResizing.Hug,
        },
        caption: {
            ...defaultConfig.caption,
            layoutAlignment: LayoutAlignment.TopMiddle,
            horizontalResizing: HorizontalResizing.Fill,
            verticalResizing: VerticalResizing.Hug,
        },
    },
};

const FieldData = ({
    label,
    children,
    variant = FieldDataVariant.Default,
    caption,
    captionTag = 'p',
    className,
    sentenceCase,
    editable,
    labelClassName,
    ...tooltipProps
}: FieldDataProps) => (
    <ResponsiveFlex
        data-testid={FieldDataTest.Container}
        {...filterTruthyProps(fieldDataMapping[variant].container)}
        className={clsx(fieldDataMapping[variant].container.className, className)}
    >
        <ResponsiveFlex data-testid={FieldDataTest.Label} {...filterTruthyProps(fieldDataMapping[variant].label)}>
            <Label
                variant={fieldDataMapping[variant].label.typography as LabelVariant}
                label={label}
                sentenceCase={sentenceCase}
                editable={editable}
                className={labelClassName}
                {...filterTruthyProps(tooltipProps)}
            />
        </ResponsiveFlex>
        <ResponsiveFlex data-testid={FieldDataTest.Value} {...filterTruthyProps(fieldDataMapping[variant].value)}>
            <Typography variant={fieldDataMapping[variant].value.typography as TypographyVariant}>{children}</Typography>
        </ResponsiveFlex>
        {!!caption && (
            <ResponsiveFlex data-testid={FieldDataTest.Caption} {...filterTruthyProps(fieldDataMapping[variant].caption)}>
                <Typography asTag={captionTag} variant={fieldDataMapping[variant].caption.typography as TypographyVariant}>
                    {caption}
                </Typography>
            </ResponsiveFlex>
        )}
    </ResponsiveFlex>
);

export default FieldData;
