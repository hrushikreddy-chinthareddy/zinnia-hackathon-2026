import ActiveAging from '@deps/components/dashboard/active-aging/active-aging';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { NigoOpenTransactions } from '@deps/components/dashboard/nigo-open-transactions/nigo-open-transactions';
import { SubmissionType } from '@deps/components/dashboard/submission-type/submission-type';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
export const OpenTransactions = () => {
    return (
        <div className={styles.container}>
            <div className={sharedStyles.dashboardCard}>
                <ActiveAging />
            </div>
            <div className={sharedStyles.dashboardCard}>
                <SubmissionType />
            </div>
            <div className={sharedStyles.dashboardCard}>
                <NigoOpenTransactions />
            </div>
        </div>
    );
};
