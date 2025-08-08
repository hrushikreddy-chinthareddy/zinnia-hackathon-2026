import clsx from 'clsx';
import { HTMLAttributes, ReactNode } from 'react';

import styles from './summary.module.css';

type ContentEntryProps = {
    label?: string | null;
    children?: ReactNode;
    ddAriaLabel?: string;
    ddProps?: HTMLAttributes<HTMLDivElement>;
    ddClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function IllustrationSelectForApplicationContentEntry({
    label,
    children,
    ddAriaLabel,
    ddProps = {},
    ddClassName,
    ...rest
}: ContentEntryProps) {
    return (
        <>
            <dt className={styles.contentEntryTerm} {...rest}>
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
