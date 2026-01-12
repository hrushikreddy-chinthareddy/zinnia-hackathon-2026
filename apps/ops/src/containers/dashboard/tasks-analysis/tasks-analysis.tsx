import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CompletedTaskTime } from '@deps/components/dashboard/sections/completed-task-times/completed-task-times';
import { TasksVolume } from '@deps/components/dashboard/sections/tasks-volume/tasks-volume';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import styles from '@deps/pages/analytics/Dashboard.module.css';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

export const TasksAnalysis = () => {
    const { featureFlags } = useOptimizely();
    const completedTaskTimeEnabled =
        featureFlags[FEATURE_FLAGS.DASHBOARD_COMPLETED_TASK_TIME_TABLE];
    return (
        <div className={styles.container}>
            <div
                className={clsx(
                    sharedStyles.dashboardCard,
                    sharedStyles.dashboardCardFirst
                )}
            >
                <TasksVolume />
            </div>
            {completedTaskTimeEnabled && (
                <div className={sharedStyles.dashboardCard}>
                    <CompletedTaskTime />
                </div>
            )}
        </div>
    );
};
