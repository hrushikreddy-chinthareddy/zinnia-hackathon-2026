import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';

import { CompletedTaskTimeContext } from '../../context/completed-task-times-context';

export const CompletedTaskTimesHeader = () => {
    const { completedTaskTimeDataFetching, totalTaskCount } = useContext(
        CompletedTaskTimeContext
    );

    const totalTasks = completedTaskTimeDataFetching ? (
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
            title={String(t('caseStats.completedTaskTimes.title') ?? '')}
            subtitle={totalTasks}
            description={String(
                t('caseStats.completedTaskTimes.description') ?? ''
            )}
        />
    );
};
