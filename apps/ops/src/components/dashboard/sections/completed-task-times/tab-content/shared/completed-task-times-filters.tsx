import clsx from 'clsx';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useCompletedTaskTimes } from '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-context';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';

export const CompletedTaskTimesFilters = () => {
    const {
        timeframeRadio,
        handleTimeframeRadioChange,
        timerange,
        handleRangeChange,
    } = useCompletedTaskTimes();
    return (
        <div
            className={clsx(
                sharedStyles.filterContainer,
                sharedStyles.filterContainerRight
            )}
        >
            <div>
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
