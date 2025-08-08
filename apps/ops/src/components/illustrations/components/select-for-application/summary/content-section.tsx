import clsx from 'clsx';
import { HTMLAttributes, ReactNode } from 'react';

import styles from './summary.module.css';

interface ContentSection
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
    title: string;
    children: ReactNode;
}

export default function IllustrationSelectForApplicationContentSection({
    className,
    title,
    children,
}: ContentSection) {
    return (
        <section className={clsx(className, styles.contentSection)}>
            <h3>{title}</h3>

            {children}
        </section>
    );
}
