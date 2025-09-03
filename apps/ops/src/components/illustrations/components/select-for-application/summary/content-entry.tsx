import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import styles from './summary.module.css';

type ContentEntryProps = {
    label?: string | null;
    ddAriaLabel?: string;
    ddProps?: HTMLAttributes<HTMLDivElement>;
    ddClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function IllustrationSelectForApplicationContentEntry({
    label,
    className,
    children,
    ddAriaLabel,
    ddProps = {},
    ddClassName,
    ...rest
}: ContentEntryProps) {
    return (
        <>
            <dt className={clsx(styles.contentEntryTerm, className)} {...rest}>
                {label}
            </dt>
            <dd
                className={clsx(styles.contentEntryDetails, ddClassName)}
                {...ddProps}
                aria-label={ddAriaLabel}
            >
                {children}
            </dd>
        </>
    );
}
