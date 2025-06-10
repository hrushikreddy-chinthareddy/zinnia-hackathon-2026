import { FC } from 'react';

import styles from './nigo-overview.module.css';
import { NIGOTransactions } from './nigo-transactions';
import { TotalExceptions } from './total-exceptions';
export const NIGOOverview: FC = () => {
    return (
        <div className={styles.wrapper}>
            <NIGOTransactions />

            <TotalExceptions />
        </div>
    );
};
