import { FC } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TaskStatusFilter } from '@deps/components/dashboard/filters/task-status-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTasksVolume } from '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context';
import { TaskVolumeTimeframeOptions } from '@deps/components/dashboard/sections/tasks-volume/utils';

export const TasksVolumeFilters: FC = () => {
    const {
        timeframeRadio,
        handleTimeframeRadioChange,
        timerange,
        handleRangeChange,
    } = useTasksVolume();

    return (
        <div className={sharedStyles.filterContainer}>
            <div className={sharedStyles.filterItem}>
                <TaskStatusFilter />
            </div>
            <div className={sharedStyles.filterItem}>
                <TimeFilter
                    defaultValue={timeframeRadio}
                    onRadioChange={(val) => {
                        handleTimeframeRadioChange(
                            val as TaskVolumeTimeframeOptions
                        );
                    }}
                    controlledTimeValue={timeframeRadio}
                    timerange={timerange}
                    handleTimerangeChange={handleRangeChange}
                    timeframeOptions={TaskVolumeTimeframeOptions}
                />
            </div>
        </div>
    );
};
