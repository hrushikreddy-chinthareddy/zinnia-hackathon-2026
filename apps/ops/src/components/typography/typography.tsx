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
    H5 = 'h5',
    H6 = 'h6',
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
    NavLinks = 'nav-links',
    NavLinksSm = 'nav-links-sm',
}

type TypographyData = {
    styles: string;
    tag: ElementType;
};

const typographyMapping: Record<TypographyVariant, TypographyData> = {
    [TypographyVariant.H1]: {
        styles: 'headline-1',
        tag: 'h1',
    },
    [TypographyVariant.H2]: {
        styles: 'headline-2',
        tag: 'h2',
    },
    [TypographyVariant.H2acc]: {
        styles: 'headline-2-acc',
        tag: 'h2',
    },
    [TypographyVariant.H3]: {
        styles: 'headline-3',
        tag: 'h3',
    },
    [TypographyVariant.H4]: {
        styles: 'headline-4',
        tag: 'h4',
    },
    [TypographyVariant.H5]: {
        styles: 'headline-5',
        tag: 'h5',
    },
    [TypographyVariant.H6]: {
        styles: 'headline-6',
        tag: 'h6',
    },
    [TypographyVariant.Caption]: {
        styles: 'typography-content-caption',
        tag: 'label',
    },
    [TypographyVariant.Body]: {
        styles: 'typography-content-body',
        tag: 'p',
    },
    [TypographyVariant.BodySm]: {
        styles: 'typography-content-body-sm',
        tag: 'p',
    },
    [TypographyVariant.BodyBold]: {
        styles: 'typography-content-body-bold',
        tag: 'p',
    },
    [TypographyVariant.BodySmBold]: {
        styles: 'typography-content-body-sm-bold',
        tag: 'p',
    },
    [TypographyVariant.BodyParagraph]: {
        styles: 'typography-content-body-paragraph',
        tag: 'p',
    },
    [TypographyVariant.Value]: {
        styles: 'typography-content-value',
        tag: 'span',
    },
    [TypographyVariant.FieldLabel]: {
        styles: 'typography-labels-field-label',
        tag: 'label',
    },
    [TypographyVariant.Label]: {
        styles: 'typography-labels-label',
        tag: 'label',
    },
    [TypographyVariant.LabelMd]: {
        styles: 'typography-labels-label-md',
        tag: 'label',
    },
    [TypographyVariant.LabelMdAlt]: {
        styles: 'typography-labels-label-md-alt',
        tag: 'label',
    },
    [TypographyVariant.LabelLg]: {
        styles: 'typography-labels-label-lg',
        tag: 'label',
    },
    [TypographyVariant.LabelLgAlt]: {
        styles: 'typography-labels-label-lg-alt',
        tag: 'label',
    },
    [TypographyVariant.LabelAlt]: {
        styles: 'typography-labels-label-alt',
        tag: 'label',
    },
    [TypographyVariant.NavLinks]: {
        styles: 'nav-links',
        tag: 'a',
    },
    [TypographyVariant.NavLinksSm]: {
        styles: 'nav-links-sm',
        tag: 'a',
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
