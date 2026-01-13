import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTiming } from '@deps/components/dashboard/sections/case-timing/case-timing';
import { TransactionTrends } from '@deps/components/dashboard/sections/transaction-trends/transaction-trends';
import styles from '@deps/pages/analytics/Dashboard.module.css';

export const ClosedTransactions = () => {
    return (
        <div className={styles.container}>
            <div
                className={clsx(
                    sharedStyles.dashboardCard,
                    sharedStyles.dashboardCardFirst
                )}
            >
                <CaseTiming />
            </div>

            <div className={sharedStyles.dashboardCard}>
                <TransactionTrends />
            </div>
        </div>
    );
};
