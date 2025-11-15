import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { HTMLAttributes, ReactNode } from 'react';

import styles from './summary.module.css';

interface ContentSection
    extends Pick<HTMLAttributes<HTMLDivElement>, 'className'> {
    title: string;
    indicators?: string[];
    children: ReactNode;
}

export default function IllustrationSelectForApplicationContentSection({
    className,
    title,
    indicators = [],
    children,
}: ContentSection) {
    return (
        <section className={clsx(className, styles.contentSection)}>
            <div className={styles.contentSectionHeader}>
                <h3>{title}</h3>
                {!!indicators.length && (
                    <AssistiveText
                        variant={AssistiveTextVariant.Info}
                        text={indicators.join(', ')}
                    />
                )}
            </div>

            {children}
        </section>
    );
}
