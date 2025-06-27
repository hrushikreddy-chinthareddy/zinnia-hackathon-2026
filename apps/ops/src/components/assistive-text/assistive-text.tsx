import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import { ReactComponent as AlertExclamationIcon } from '@deps/styles/elements/icons/alert/alert-exclamation.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { ReactComponent as CheckIcon } from '@deps/styles/elements/icons/icons_outlined/checkmark.svg';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

export enum AssistiveTextVariant {
    Default = 'default',
    Inactive = 'inactive',
    Brand = 'brand',
    Success = 'success',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
}

export type AssistiveTextProps = {
    text: string;
    variant?: AssistiveTextVariant;
    iconOverride?: React.ReactNode;
} & HTMLAttributes<HTMLParagraphElement>;

const determineIcon = (
    variant?: AssistiveTextVariant,
    iconOverride?: React.ReactNode
) => {
    if (iconOverride) return iconOverride;

    const classes = 'shrink-0 mt-[0.5px]';
    switch (variant) {
        case AssistiveTextVariant.Error:
            return (
                <HexExclamationIcon
                    role="presentation"
                    className={classes}
                    data-testid={'hex-exclamation-icon'}
                    width={16}
                    height={16}
                />
            );
        case AssistiveTextVariant.Info:
            return (
                <AlertExclamationIcon
                    role="presentation"
                    className={classes}
                    data-testid={'alert-exclamation-icon'}
                    width={16}
                    height={16}
                />
            );
        case AssistiveTextVariant.Success:
            return (
                <CircleCheckIcon
                    role="presentation"
                    className={classes}
                    data-testid={'circle-check-icon'}
                    width={16}
                    height={16}
                />
            );
        case AssistiveTextVariant.Warning:
            return (
                <CircleInfoIcon
                    role="presentation"
                    className={classes}
                    data-testid={'circle-info-icon'}
                    width={16}
                    height={16}
                />
            );
        case AssistiveTextVariant.Brand:
        case AssistiveTextVariant.Default:
        case AssistiveTextVariant.Inactive:
        default:
            return (
                <CheckIcon
                    role="presentation"
                    className={classes}
                    data-testid={'check-icon'}
                    width={16}
                    height={16}
                />
            );
    }
};

export default function AssistiveText({
    text,
    variant,
    iconOverride,
    ...rest
}: AssistiveTextProps) {
    const { className, ...newRest } = rest;

    const icon = determineIcon(variant, iconOverride);

    const classes = clsx(
        'caption-selected flex w-full flex-row items-start gap-1',
        {
            'text-gray-900': variant === AssistiveTextVariant.Default,
            'text-gray-300': variant === AssistiveTextVariant.Inactive,
            'text-secondary': variant === AssistiveTextVariant.Brand,
            'text-semantic-success': variant === AssistiveTextVariant.Success,
            'text-semantic-info': variant === AssistiveTextVariant.Info,
            'text-semantic-warning': variant === AssistiveTextVariant.Warning,
            'text-semantic-error': variant === AssistiveTextVariant.Error,
        },
        className
    );

    return (
        <div className={classes} {...newRest}>
            {icon}
            <p>{text}</p>
        </div>
    );
}
