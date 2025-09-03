import clsx from 'clsx';
import { ReactNode, HTMLAttributes } from 'react';

import styles from './content-section.module.css';

interface IllustrationDetailsContentSection
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
    title: string;
    children: ReactNode;
}

export default function IllustrationDetailsContentSection({
    className,
    title,
    children,
}: IllustrationDetailsContentSection) {
    return (
        <section className={clsx(className, styles.section)}>
            <h3 className={styles.sectionTitle}>{title}</h3>

            {children}
        </section>
    );
}
