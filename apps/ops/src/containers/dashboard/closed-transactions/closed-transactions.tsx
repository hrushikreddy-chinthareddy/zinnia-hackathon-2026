import clsx from 'clsx';

import { CaseToCloseTimeChart } from '@deps/components/dashboard/case-to-close-time-chart/case-to-close-time-chart';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { NigoClosedTransactions } from '@deps/components/dashboard/nigo-closed-transactions/nigo-closed-transactions';
import { TransactionTrends } from '@deps/components/dashboard/transaction-trends/transaction-trends';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

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
    const { featureFlags } = useOptimizely();

    return (
        <div className={styles.container}>
            {featureFlags[FEATURE_FLAGS.DASHBOARD_CASE_TIMING_CHART] && (
                <div className={clsx(sharedStyles.dashboardCard, sharedStyles.dashboardCardFirst)}>
                    <CaseToCloseTimeChart />
                </div>
            )}

            <div className={sharedStyles.dashboardCard}>
                <TransactionTrends />
            </div>
            <div className={sharedStyles.dashboardCard}>
                <NigoClosedTransactions />
            </div>
        </div>
    );
};
