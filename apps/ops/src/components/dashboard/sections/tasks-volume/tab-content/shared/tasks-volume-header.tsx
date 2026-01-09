import { useTranslation } from 'react-i18next';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { useTasksVolume } from '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context';

export const TasksVolumeHeader = () => {
    const { taskVolumeDataFetching, totalTaskCount } = useTasksVolume();

    const totalTasks = taskVolumeDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>
                {totalTaskCount?.toLocaleString() || '0'} tasks
            </p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>
            {totalTaskCount?.toLocaleString() || '0'} tasks
        </p>
    );
    const { t } = useTranslation();

    return (
        <ChartHeader
            title={String(t('caseStats.tasks.title') ?? '')}
            subtitle={totalTasks}
            description={String(t('caseStats.tasks.description') ?? '')}
        />
    );
};
