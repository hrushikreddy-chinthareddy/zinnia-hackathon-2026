import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { IssueCountsByStatus } from '@deps/components/dashboard/sections/issue-counts-by-status/issue-counts-by-status';
import { NIGOOverview } from '@deps/components/dashboard/sections/nigo-overview/nigo-overview';
import styles from '@deps/pages/analytics/Dashboard.module.css';

export const NIGOAnalysis = () => {
    return (
        <div className={styles.container}>
            <div
                className={clsx(
                    sharedStyles.dashboardCard,
                    sharedStyles.dashboardCardFirst
                )}
            >
                <NIGOOverview />
            </div>
            <div className={clsx(sharedStyles.dashboardCard)}>
                <IssueCountsByStatus />
            </div>
        </div>
    );
};
