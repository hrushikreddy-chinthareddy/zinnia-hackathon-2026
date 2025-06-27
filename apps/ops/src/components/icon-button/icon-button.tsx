import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import styles from './icon-button.module.css';

interface IconButtonProps extends HTMLAttributes<HTMLButtonElement> {
    disabled?: boolean;
}

export default function IconButton({
    children,
    disabled,
    onClick,
    ...rest
}: IconButtonProps) {
    const { className, ...newRest } = rest;

    return (
        <button
            className={clsx(styles.iconButton)}
            disabled={disabled}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onClick;
                }
            }}
            type="button"
            {...newRest}
        >
            {children}
        </button>
    );
}
