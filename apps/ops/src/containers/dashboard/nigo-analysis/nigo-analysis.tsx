import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { NIGOOverview } from '@deps/components/dashboard/sections/nigo-overview/nigo-overview';
import styles from '@deps/pages/dashboard/Dashboard.module.css';

export const NIGOAnalysis = () => {
    return (
        <div className={styles.container}>
            <div className={clsx(sharedStyles.dashboardCard, sharedStyles.dashboardCardFirst)}>
                <NIGOOverview />
            </div>
        </div>
    );
};
