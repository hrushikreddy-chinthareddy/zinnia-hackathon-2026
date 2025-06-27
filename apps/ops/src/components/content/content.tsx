import clsx from 'clsx';
import { PropsWithChildren } from 'react';

import { PiiProps } from '@deps/components/pii/pii';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';

import Highlighter from '../highlighter/highlighter';
import PopoverOnTruncate from '../popover-on-truncate/popover-on-truncate';

export enum ContentVariant {
    Body = 'body',
    BodySm = 'body-sm',
    BodyBold = 'body-bold',
    BodySmBold = 'body-sm-bold',
    BodyParagraph = 'body-paragraph',
    ListItem = 'list-item',
    Value = 'value',
    Caption = 'caption',
    CaptionSelected = 'caption-selected',
    ArticleReferences = 'article-references',
    Footer = 'footer',
    FooterLegal = 'footer-legal',
}

interface ContentProps extends PropsWithChildren<PiiProps> {
    className?: string;
    contentClassName?: string;
    details?: string;
    highlights?: string[];
    truncate?: boolean;
    variant?: ContentVariant;
    popoverBody?: string | JSX.Element;
    popoverClassName?: string;
    required?: boolean;
}

export const Content = ({
    details,
    variant = ContentVariant.Body,
    highlights,
    truncate,
    popoverBody,
    popoverClassName,
    required = false,
    pii = false,
    ...rest
}: ContentProps) => {
    const { className, contentClassName, ...newRest } = rest;
    const renderedText = highlights ? (
        <Highlighter text={details} highlights={highlights} />
    ) : (
        details
    );

    const classes = clsx(
        'tracking-normal no-underline',
        {
            'font-secondary text-base font-normal leading-[24px]':
                variant === ContentVariant.Body,
            'font-secondary text-md font-normal leading-[22px]':
                variant === ContentVariant.BodySm,
            'font-secondary text-base font-bold leading-[24px]':
                variant === ContentVariant.BodyBold,
            'font-secondary text-md font-bold leading-[22px]':
                variant === ContentVariant.BodySmBold,
            'font-secondary text-base font-normal leading-[28px]':
                variant === ContentVariant.BodyParagraph,
            'font-primary text-xl font-medium leading-[24px]':
                variant === ContentVariant.Value,
            'font-primary text-sm font-medium leading-[16px]':
                variant === ContentVariant.Caption,
            'font-primary text-sm font-semibold leading-[16px]':
                variant === ContentVariant.CaptionSelected,
            'font-primary text-base italic leading-[28px]':
                variant === ContentVariant.ArticleReferences,
            'font-primary text-base': variant === ContentVariant.Footer,
            'font-secondary text-sm leading-[18px]':
                variant === ContentVariant.FooterLegal,
        },
        {
            'line-clamp-1 break-all': truncate,
        },
        className
    );

    const contentClasses = clsx('break-words', contentClassName);

    const childContentForTruncate = () => (
        <>
            {renderedText}
            {required && <span className="text-semantic-error">&nbsp;*</span>}
        </>
    );

    const textContent = truncate ? (
        <PopoverOnTruncate
            popoverClassName={popoverClassName}
            title={popoverBody ?? details}
        >
            {pii ? (
                <PiiWrapper className={classes} {...newRest}>
                    {childContentForTruncate()}
                </PiiWrapper>
            ) : (
                <span className={classes} {...newRest}>
                    {childContentForTruncate()}
                </span>
            )}
        </PopoverOnTruncate>
    ) : pii ? (
        <PiiWrapper className={classes} {...newRest}>
            {renderedText}
        </PiiWrapper>
    ) : (
        <span className={classes} {...newRest}>
            {renderedText}
        </span>
    );

    return <div className={contentClasses}>{textContent}</div>;
};

export default Content;
