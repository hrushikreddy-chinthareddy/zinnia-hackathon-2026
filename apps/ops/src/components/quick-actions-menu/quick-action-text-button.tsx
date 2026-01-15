import clsx from 'clsx';
import { forwardRef } from 'react';

import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

import styles from './quick-actions-menu.module.css';

interface TextButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    chevronPosition?: 'start' | 'end';
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
    ({ label, chevronPosition = 'end', className, ...props }, ref) => {
        const chevron = (
            <ChevronDown
                className="simple-transition group-data-[state=open]:rotate-180"
                height={16}
                width={16}
                aria-hidden="true"
            />
        );

        return (
            <button
                type="button"
                ref={ref}
                {...props}
                className={clsx(
                    styles.quickActions,
                    'default-focus',
                    className
                )}
            >
                {chevronPosition === 'start' && chevron}
                <span className="text-links">{label}</span>
                {chevronPosition === 'end' && chevron}
            </button>
        );
    }
);

TextButton.displayName = 'TextButton';
