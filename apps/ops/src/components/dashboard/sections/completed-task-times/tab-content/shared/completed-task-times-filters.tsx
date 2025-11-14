import { FC, useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { CompletedTaskTimeContext } from '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-context';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';

export const CompletedTaskTimesFilters: FC = () => {
    const {
        timeframeRadio,
        handleTimeframeRadioChange,
        timerange,
        handleRangeChange,
    } = useContext(CompletedTaskTimeContext);

    return (
        <div className={sharedStyles.filterContainer}>
            <div className="w-full">
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
