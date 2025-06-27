import clsx from 'clsx';
import { JSXElementConstructor, ReactElement } from 'react';

import { BadgeTest } from '@deps/jest/constants/test-id-constants';

import { BadgeVariant } from './badge.helpers';

export interface BadgeProps {
    variant: BadgeVariant;
    label: string;
    className?: string;
    icon?: ReactElement<any, string | JSXElementConstructor<any>>;
    rounded?: boolean;
}

const badgeVariantToBadgeType = (variant: BadgeVariant, classNames = '') => {
    const newClasses = clsx(
        {
            'border-gray-200 bg-gray-50 text-gray-900':
                variant === BadgeVariant.Default,
            'border-semantic-info bg-semantic-info-light text-semantic-info':
                variant === BadgeVariant.Info,
            'border-semantic-success bg-semantic-success-light text-semantic-success':
                variant === BadgeVariant.Positive ||
                variant === BadgeVariant.Success,
            'border-semantic-warning bg-semantic-warning-light text-semantic-warning':
                variant === BadgeVariant.Warning,
            'border-semantic-error bg-semantic-error-light text-semantic-error':
                variant === BadgeVariant.Error ||
                variant === BadgeVariant.Negative ||
                variant === BadgeVariant.Urgent,
            'border-gray-300 bg-gray-100 text-gray-300':
                variant === BadgeVariant.Inactive,
            'border-semantic-pending bg-semantic-pending-light text-semantic-pending':
                variant === BadgeVariant.Pending,
            'border-gray-600 bg-white text-gray-600 ':
                variant === BadgeVariant.Neutral,
            'border-secondary bg-white text-secondary':
                variant === BadgeVariant.Brand,
        },
        classNames
    );

    return newClasses;
};

const Badge = ({
    variant,
    rounded,
    label,
    icon,
    className,
}: BadgeProps): JSX.Element => {
    const variantClasses = badgeVariantToBadgeType(variant, className);
    const roundedClasses = rounded
        ? 'rounded-full px-2 py-1'
        : 'rounded px-[6px]';

    return (
        <span
            data-testid={BadgeTest.Badge}
            className={`w-fit align-center flex cursor-default border-2 font-primary text-sm font-semibold leading-4 ${variantClasses} ${roundedClasses}`}
        >
            <span>{icon}</span>
            <span className="m-auto flex flex-shrink">{label}</span>
        </span>
    );
};

export default Badge;
