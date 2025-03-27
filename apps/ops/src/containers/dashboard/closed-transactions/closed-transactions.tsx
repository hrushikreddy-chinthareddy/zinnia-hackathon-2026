import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTiming } from '@deps/components/dashboard/sections/case-timing/case-timing';
import { NigoClosedTransactions } from '@deps/components/dashboard/sections/nigo-closed-transactions/nigo-closed-transactions';
import { TransactionTrends } from '@deps/components/dashboard/sections/transaction-trends/transaction-trends';
import styles from '@deps/pages/dashboard/Dashboard.module.css';

export interface CarrierListItem {
    [key: string]: string;
}

export const ClosedTransactions = () => {
    return (
        <div className={styles.container}>
            <div className={clsx(sharedStyles.dashboardCard, sharedStyles.dashboardCardFirst)}>
                <CaseTiming />
            </div>

            <div className={sharedStyles.dashboardCard}>
                <TransactionTrends />
            </div>
            <div className={sharedStyles.dashboardCard}>
                <NigoClosedTransactions />
            </div>
        </div>
    );
};
