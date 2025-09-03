import clsx from 'clsx';
import { ReactNode, HTMLAttributes } from 'react';

import styles from './content-entry.module.css';

type IllustrationDetailsContentEntryProps = {
    label?: string | null;
    children?: ReactNode;
    ddAriaLabel?: string;
    ddProps?: HTMLAttributes<HTMLDivElement>;
    ddClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function IllustrationDetailsContentEntry({
    className,
    ddClassName,
    label,
    children,
    ddAriaLabel,
    ddProps = {},
    ...rest
}: IllustrationDetailsContentEntryProps) {
    return (
        <>
            <dt className={clsx(styles.label, className)} {...rest}>
                {label}
            </dt>
            <dd
                className={clsx(styles.value, ddClassName)}
                {...ddProps}
                {...(ddAriaLabel && { 'aria-label': ddAriaLabel })}
            >
                {children}
            </dd>
        </>
    );
}
