import { useTranslation } from 'react-i18next';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';

import { useCompletedTaskTimes } from '../../context/completed-task-times-context';

export const CompletedTaskTimesHeader = () => {
    const { completedTaskTimeDataFetching, totalTaskCount } =
        useCompletedTaskTimes();

    const totalTasks = (
        <div className={`${completedTaskTimeDataFetching ? 'blur' : ''}`}>
            <p className={'typography-titles-subtitle'}>
                {totalTaskCount.toLocaleString()} tasks
            </p>
        </div>
    );
    const { t } = useTranslation();

    return (
        <ChartHeader
            title={t('caseStats.completedTaskTimes.title')}
            subtitle={totalTasks}
            description={t('caseStats.completedTaskTimes.description')}
        />
    );
};
