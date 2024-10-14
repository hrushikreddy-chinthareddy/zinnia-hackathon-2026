import clsx from 'clsx';
import { ReactNode } from 'react';

import { FieldVariant } from './field';

export type FieldIconProps = {
    icon?: ReactNode;
    variant?: FieldVariant;
    className?: string;
};

export default function FieldIcon({ icon, variant, className }: FieldIconProps) {
    if (!icon) return null;

    const classes = clsx(
        {
            'text-gray-300': variant === FieldVariant.Inactive,
            'text-semantic-error': variant === FieldVariant.Error,
            'text-secondary': variant !== FieldVariant.Inactive && variant !== FieldVariant.Error,
        },
        className
    );

    return <div className={classes} data-testid="field-icon">{icon}</div>;
}
