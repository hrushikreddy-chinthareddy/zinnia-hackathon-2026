import { useTranslation } from 'react-i18next';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { useTasksVolume } from '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context';

import styles from './tasks-volume-header.module.css';

export const TasksVolumeHeader = () => {
    const { t } = useTranslation();
    const { taskVolumeDataFetching, totalTaskCount } = useTasksVolume();

    const count = totalTaskCount?.toLocaleString() ?? '0';
    const totalCountLabel = String(
        t('allFields.taskVolumeTotalCount', { count } as Record<string, string>)
    );

    const totalTasks = taskVolumeDataFetching ? (
        <div className={styles.loadingSubtitle}>
            <p className={styles.subtitle}>{totalCountLabel}</p>
        </div>
    ) : (
        <p className={styles.subtitle}>{totalCountLabel}</p>
    );

    return (
        <ChartHeader
            title={String(t('allFields.taskVolumeTitle') ?? '')}
            subtitle={totalTasks}
            description={String(t('allFields.taskVolumeDescription') ?? '')}
        />
    );
};
