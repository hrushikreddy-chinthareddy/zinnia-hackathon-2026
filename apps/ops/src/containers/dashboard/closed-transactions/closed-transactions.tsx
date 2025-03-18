import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTimingProvider } from '@deps/components/dashboard/sections/case-timing/context/case-timing-context';
import { CaseTimingChart } from '@deps/components/dashboard/sections/case-timing/tab-content/chart/case-timing-chart';
import { NigoClosedTransactions } from '@deps/components/dashboard/sections/nigo-closed-transactions/nigo-closed-transactions';
import { TransactionTrends } from '@deps/components/dashboard/sections/transaction-trends/transaction-trends';
import styles from '@deps/pages/dashboard/Dashboard.module.css';

export interface CarrierListItem {
    [key: string]: string;
}

export enum TimeframeFilterOptions {
    Trailing12Months = '12M',
    Last6Months = '6M',
    Last90Days = '3M',
    Last60Days = '2M',
    LastMonth = '1M',
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
                <TransactionTrends />
            </div>
            <div className={sharedStyles.dashboardCard}>
                <NigoClosedTransactions />
            </div>
        </div>
    );
};
