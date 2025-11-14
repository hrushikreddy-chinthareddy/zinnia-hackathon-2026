import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CompletedTaskTime } from '@deps/components/dashboard/sections/completed-task-times/completed-task-times';
import { TasksVolume } from '@deps/components/dashboard/sections/tasks-volume/tasks-volume';
import styles from '@deps/pages/dashboard/Dashboard.module.css';

export const TasksVolumeContainer = () => {
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
            <div className={sharedStyles.dashboardCard}>
                <CompletedTaskTime />
            </div>
        </div>
    );
};
