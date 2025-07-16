import { FC } from 'react';

import styles from './legend.module.css';

interface LegendProps {
    title?: string;
    colors: string[];
    labels: string[];
}

export const Legend: FC<LegendProps> = ({ title, colors, labels }) => {
    return (
        <div className={styles.legendContainer}>
            <div className="typography-content-body-sm-bold">{title}</div>
            <div className={styles.itemsContainer}>
                {labels?.map((label, index) => (
                    <div key={index} className={styles.item}>
                        <div
                            className={styles.color}
                            style={{ backgroundColor: colors[index] }}
                        ></div>
                        <div className="typography-content-body-sm">
                            {label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
