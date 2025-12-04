import { FC } from 'react';

import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useCompletedTaskTimes } from '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-context';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';

import filterStyles from './completed-task-times-filters.module.css';

export const CompletedTaskTimesFilters: FC = () => {
    const {
        timeframeRadio,
        handleTimeframeRadioChange,
        timerange,
        handleRangeChange,
    } = useCompletedTaskTimes();

    return (
        <div className={filterStyles.filterContainer}>
            <TimeFilter
                defaultValue={timeframeRadio}
                onRadioChange={(val) => {
                    handleTimeframeRadioChange(val as TimeframeFilterOptions);
                }}
                controlledTimeValue={timeframeRadio}
                timerange={timerange}
                handleTimerangeChange={handleRangeChange}
            />
        </div>
    );
};
