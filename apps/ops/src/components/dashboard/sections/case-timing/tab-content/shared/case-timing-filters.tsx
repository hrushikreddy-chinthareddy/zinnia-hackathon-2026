import { useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { CaseTimingContext } from '@deps/components/dashboard/sections/case-timing/context/case-timing-context';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { Statuses, Processes } from '@deps/models/case/case';

export const CaseTimingFilters = () => {
    const { timeframe, setTimeframe, setSelectedProcess, selectedProcess } = useContext(CaseTimingContext);
    return (
        <div className={sharedStyles.filterContainer}>
            <div className="w-1/4">
                <CaseTypeFilter
                    onValueChange={setSelectedProcess}
                    caseStatus={[Statuses.Completed]}
                    defaultProcess={Processes.NewBusiness}
                    value={selectedProcess}
                />
            </div>
            <div className="w-3/4">
                <TimeFilter defaultValue={timeframe} onValueChange={val => setTimeframe(val as TimeframeFilterOptions)} />
            </div>
        </div>
    );
};
