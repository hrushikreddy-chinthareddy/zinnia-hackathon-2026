import clsx from 'clsx';
import { ReactNode } from 'react';

import { FieldVariant } from './field';

export enum FieldUnitsLocation {
    Start = 'start',
    End = 'end',
}

export type FieldUnitsProps = {
    children?: ReactNode;
    location?: FieldUnitsLocation;
    variant?: FieldVariant;
};

export default function FieldUnits({ children, location, variant }: FieldUnitsProps) {
    if (!children) return null;

    // min-w-[32px] for edge case when Field is within a container that restricts width of Field
    const classes = clsx(
        'flex min-w-[32px] items-center overflow-hidden bg-gray-50 px-1.5 font-secondary text-md font-bold leading-5.5 text-gray-900',
        {
            'rounded-l-lg border-r-2': location === FieldUnitsLocation.Start,
            'rounded-r-lg border-l-2': location === FieldUnitsLocation.End,
            'justify-center': !!location,
        },
        {
            'border-gray-300 bg-gray-100 text-gray-300': variant === FieldVariant.Inactive,
            'border-semantic-error bg-gray-50 text-semantic-error': variant === FieldVariant.Error,
            'border-semantic-success bg-gray-50 text-semantic-success': variant === FieldVariant.Success,
        }
    );

    return <div className={classes}>{children}</div>;
}
