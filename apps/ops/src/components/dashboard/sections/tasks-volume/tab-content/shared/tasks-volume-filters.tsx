import { FC, useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TaskStatusFilter } from '@deps/components/dashboard/filters/task-status-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { TasksVolumeContext } from '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';

export const TasksVolumeFilters: FC = () => {
    const {
        timeframeRadio,
        handleTimeframeRadioChange,
        timerange,
        handleRangeChange,
    } = useContext(TasksVolumeContext);

    return (
        <div className={sharedStyles.filterContainer}>
            <div className="flex gap-4 items-start">
                <TaskStatusFilter />
            </div>
            <div className="w-1/2">
                <TimeFilter
                    defaultValue={timeframeRadio}
                    onRadioChange={(val) => {
                        handleTimeframeRadioChange(
                            val as TimeframeFilterOptions
                        );
                    }}
                    controlledTimeValue={timeframeRadio}
                    timerange={timerange}
                    handleTimerangeChange={handleRangeChange}
                />
            </div>
        </div>
    );
};
