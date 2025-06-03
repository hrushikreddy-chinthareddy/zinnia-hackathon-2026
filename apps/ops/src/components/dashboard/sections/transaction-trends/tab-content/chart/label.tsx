// LabelComponent.jsx
import clsx from 'clsx';
import React from 'react';

import styles from './label.module.css';

interface LabelData {
    color: string;
    count: number;
    label: string;
}

interface Props {
    labelData: LabelData[];
    dateStr: string;
    total: number;
}

export const LabelComponent: React.FC<Props> = ({ labelData, dateStr, total }) => {
    return (
        <div className={styles.labelWrapper}>
            {labelData.map((value, index) => (
                <div key={index} className={styles.label}>
                    <div className={styles.color} style={{ backgroundColor: value.color }} />
                    <div className={styles.labelText}>
                        {value.label}: <b>{value.count.toLocaleString()}</b>
                    </div>
                </div>
            ))}
            <div className={clsx('typography-labels-label-sm-alt', styles.date)}>
                <i>Closed date: {dateStr}</i>
            </div>
            <div className={styles.total}>
                Total: <b>{total.toLocaleString()}</b>
            </div>
        </div>
    );
};
