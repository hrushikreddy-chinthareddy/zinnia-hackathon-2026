import clsx from 'clsx';
import { FC } from 'react';

import styles from './legend.module.css';

interface LegendItem {
    color: string;
    label: string;
}

interface LegendProps {
    title: string;
    items: LegendItem[];
    containerClass?: string;
}

export const Legend: FC<LegendProps> = ({ title, items, containerClass }) => {
    const columnCount = items.length <= 2 ? items.length : 3;

    return (
        <div className={clsx(styles.legendContainer, containerClass)}>
            <div>
                <div className={clsx('typography-labels-label-sm', styles.title)}>{title}</div>
                <div className={styles.items} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.item}>
                            <div className={styles.color} style={{ backgroundColor: item.color }}></div>
                            <div className={clsx('typography-content-body-sm', styles.label)}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
