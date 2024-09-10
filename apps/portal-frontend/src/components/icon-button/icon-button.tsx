import clsx from 'clsx';
import { HTMLAttributes } from 'react';

interface IconButtonProps extends HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
}

export default function IconButton({ children, disabled, onClick, ...rest }: IconButtonProps) {
    const { className, ...newRest } = rest;

    const classes = clsx(
        'flex h-6 w-6 flex-row items-center justify-center rounded-xl',
        { 'default-focus-icons text-secondary hover:text-secondary-dark': !disabled },
        { 'cursor-not-allowed font-primary text-gray-300 hover:text-gray-300': disabled },
        className
    );

    return (
        <button
            className={classes}
            disabled={disabled}
            onClick={onClick}
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onClick;
                }
            }}
            role="button"
            tabIndex={0}
            type="button"
            {...newRest}
        >
            {children}
        </button>
    );
}
