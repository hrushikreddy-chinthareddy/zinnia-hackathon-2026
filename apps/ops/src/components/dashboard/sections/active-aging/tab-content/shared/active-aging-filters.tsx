import { FC, useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { ActiveAgingContext } from '@deps/components/dashboard/sections/active-aging/context/active-aging-context';
import { caseStatusMap } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Statuses, Processes } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { getFormattedDateRange, ActiveAgingTimeRange } from '../../utils';

export const ActiveAgingFilters: FC = () => {
    const {
        groupBy,
        setGroupBy,
        filter,
        selectedProcess,
        setSelectedProcess,
        timeframe,
        setTimeframe,

        caseStatus,
        setCaseStatus,
    } = useContext(ActiveAgingContext);
    const controlledTimeRangeText = getFormattedDateRange(timeframe);

    const groupByOptions = [
        { label: 'Carrier', value: GroupByOptions.Carrier, disabled: filter.carrier?.length === 1 },
        { label: 'Case subtype', value: GroupByOptions.ProcessSubType },
        { label: 'Distribution Partner', value: GroupByOptions.BrokerDealerName },
    ];

    const caseStatusOptions = [
        { label: 'In Progress', displayText: 'In Progress', value: Statuses.InProgress },
        { label: 'Exception', displayText: 'Exception', value: Statuses.Exception },
        { label: 'Not Started', displayText: 'Not Started', value: Statuses.NotStarted },
    ];

    const handleCaseStatusChange = (status: Statuses) => {
        const newStatus = { ...caseStatus };

        if (newStatus[status]) {
            //dont delete if its the only one selected
            if (Object.keys(newStatus).length === 1) {
                return;
            }
            delete newStatus[status];
        } else {
            newStatus[status] = caseStatusMap[status];
        }
        setCaseStatus(newStatus);
    };

    return (
        <div className={sharedStyles.filterContainer}>
            <div className="w-1/2 flex gap-2">
                <Select
                    maxContentWidth
                    label="Group by"
                    className={sharedStyles.selectDropdowns}
                    options={groupByOptions}
                    value={groupBy}
                    size={FieldSize.XS}
                    onChange={val => setGroupBy(val as GroupByOptions)}
                />

                <CaseTypeFilter
                    onValueChange={setSelectedProcess}
                    caseStatus={Object.keys(caseStatus) as Statuses[]}
                    defaultProcess={Processes.NewBusiness}
                    value={selectedProcess}
                />
                <Select
                    maxContentWidth
                    label="Case status"
                    className={sharedStyles.selectDropdowns}
                    options={caseStatusOptions}
                    value={caseStatus}
                    size={FieldSize.XS}
                    isMultiselect
                    onChange={val => handleCaseStatusChange(val as Statuses)}
                />
            </div>
            <div className="w-1/2">
                <TimeFilter
                    defaultValue={timeframe}
                    timeframeOptions={ActiveAgingTimeRange}
                    onValueChange={val => setTimeframe(val as ActiveAgingTimeRange)}
                    controlledTimeValue={timeframe}
                    controlledRangeText={controlledTimeRangeText}
                />
            </div>
        </div>
    );
};
