import clsx from 'clsx';
import { ElementType, HTMLAttributes } from 'react';

export type TypographyProps = {
    children: React.ReactNode;
    variant: TypographyVariant;
    className?: string;
    asTag?: ElementType; // allows overriding tag when we apply one style (label) to a different type (h2)
} & HTMLAttributes<HTMLHeadingElement> &
    HTMLAttributes<HTMLParagraphElement> &
    HTMLAttributes<HTMLLabelElement>;

export enum TypographyVariant {
    H1 = 'h1',
    H2 = 'h2',
    H2acc = 'h2acc',
    H3 = 'h3',
    H4 = 'h4',
    Caption = 'caption',
    Body = 'body',
    BodySm = 'body-sm',
    BodyBold = 'body-bold',
    BodySmBold = 'body-sm-bold',
    BodyParagraph = 'body-paragraph',
    Value = 'value',
    FieldLabel = 'field-label',
    Label = 'label',
    LabelMd = 'label-md',
    LabelMdAlt = 'label-md-alt',
    LabelLg = 'label-lg',
    LabelLgAlt = 'label-lg-alt',
    LabelAlt = 'label-alt',
}

type TypographyData = {
    styles: string;
    tag: ElementType;
};

const typographyMapping: Record<TypographyVariant, TypographyData> = {
    [TypographyVariant.H1]: {
        styles: 'font-primary text-[36px] font-medium leading-[44px]',
        tag: 'h1',
    },
    [TypographyVariant.H2]: {
        styles: 'font-primary text-[26px] font-medium leading-[32px]',
        tag: 'h2',
    },
    [TypographyVariant.H2acc]: {
        styles: 'font-primary text-[26px] font-bold leading-[32px]',
        tag: 'h2',
    },
    [TypographyVariant.H3]: {
        styles: 'font-primary text-[22px] font-medium leading-[28px]',
        tag: 'h3',
    },
    [TypographyVariant.H4]: {
        styles: 'font-primary text-[18px] font-medium leading-[24px]',
        tag: 'h4',
    },
    [TypographyVariant.Caption]: {
        styles: 'font-primary text-content-caption text-gray-600',
        tag: 'label',
    },
    [TypographyVariant.Body]: {
        styles: 'font-secondary text-[16px] font-normal leading-[24px]',
        tag: 'p',
    },
    [TypographyVariant.BodySm]: {
        styles: 'inline-flex font-secondary text-body-sm',
        tag: 'p',
    },
    [TypographyVariant.BodyBold]: {
        styles: 'font-secondary text-[16px] font-bold leading-[24px]',
        tag: 'p',
    },
    [TypographyVariant.BodySmBold]: {
        styles: 'font-secondary text-[14px] font-bold leading-[22px]',
        tag: 'p',
    },
    [TypographyVariant.BodyParagraph]: {
        styles: 'font-secondary text-[16px] font-normal leading-[28px]',
        tag: 'p',
    },
    [TypographyVariant.Value]: {
        styles: 'font-primary text-content-value',
        tag: 'span',
    },
    [TypographyVariant.FieldLabel]: {
        styles: 'font-primary text-[12px] font-bold',
        tag: 'label',
    },
    [TypographyVariant.Label]: {
        styles: 'font-primary text-[12px] font-semibold',
        tag: 'label',
    },
    [TypographyVariant.LabelMd]: {
        styles: 'font-primary text-[14px] font-semibold',
        tag: 'label',
    },
    [TypographyVariant.LabelMdAlt]: {
        styles: 'font-primary text-md font-medium',
        tag: 'label',
    },
    [TypographyVariant.LabelLg]: {
        styles: 'font-primary text-[16px] font-semibold',
        tag: 'label',
    },
    [TypographyVariant.LabelLgAlt]: {
        styles: 'font-primary text-[16px] font-medium',
        tag: 'label',
    },
    [TypographyVariant.LabelAlt]: {
        styles: 'font-primary text-[12px] font-medium md:text-[14px] lg:text-[16px]',
        tag: 'label',
    },
};

export default function Typography({ variant, children, asTag, ...rest }: TypographyProps) {
    const { className, ...newRest } = rest;

    const classes = clsx('tracking-normal no-underline', typographyMapping[variant].styles, className);

    const Tag = asTag ?? typographyMapping[variant].tag;

    return (
        <Tag className={classes} {...newRest}>
            {children}
        </Tag>
    );
}
