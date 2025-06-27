import clsx from 'clsx';
import { ReactNode } from 'react';

interface SelectSimpleItemProps {
    label?: string;
    labelElement?: ReactNode;
    className?: string;
    disabled?: boolean;
    selected?: boolean;
    onClick?: () => void;
}

export default function FieldSelectItem({
    label,
    labelElement,
    className,
    disabled,
    selected,
    onClick,
}: SelectSimpleItemProps) {
    const classes = clsx(
        'default-hover relative flex w-full flex-row items-center justify-start border-1 border-transparent px-4 py-2 focus:border-semantic-focus focus:outline-none',
        {
            'bg-primary-lightest': selected,
            'bg-white': !selected,
            'cursor-not-allowed bg-gray-100 text-gray-300': disabled,
            'text-gray-900': !disabled,
        },
        className
    );

    const labelClasses = clsx('font-secondary text-md leading-5.5', {
        'font-bold': selected,
        'font-normal': !selected,
    });

    return (
        <div
            className={classes}
            tabIndex={0}
            onClick={() => {
                if (onClick && !disabled) {
                    onClick();
                }
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault(); // to prevent the default action of the key press

                    if (onClick && !disabled) {
                        onClick();
                    }
                }
            }}
        >
            {label ? <p className={labelClasses}>{label}</p> : labelElement}
        </div>
    );
}
