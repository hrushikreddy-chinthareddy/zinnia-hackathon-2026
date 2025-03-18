import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTimingProvider } from '@deps/components/dashboard/sections/case-timing/context/case-timing-context';
import { CaseTimingChart } from '@deps/components/dashboard/sections/case-timing/tab-content/chart/case-timing-chart';
import { NigoClosedTransactions } from '@deps/components/dashboard/sections/nigo-closed-transactions/nigo-closed-transactions';
import { TransactionTrendsProvider } from '@deps/components/dashboard/sections/transaction-trends/context/transaction-trends-context';
import { TransactionTrends } from '@deps/components/dashboard/sections/transaction-trends/transaction-trends';
import styles from '@deps/pages/dashboard/Dashboard.module.css';

export interface CarrierListItem {
    [key: string]: string;
}

export const ClosedTransactions = () => {
    return (
        <div className={styles.container}>
            <div className={clsx(sharedStyles.dashboardCard, sharedStyles.dashboardCardFirst)}>
                <CaseTimingProvider>
                    <CaseTimingChart />
                </CaseTimingProvider>
            </div>

            <div className={sharedStyles.dashboardCard}>
                <TransactionTrendsProvider>
                    <TransactionTrends />
                </TransactionTrendsProvider>
            </div>
            <div className={sharedStyles.dashboardCard}>
                <NigoClosedTransactions />
            </div>
        </div>
    );
};
