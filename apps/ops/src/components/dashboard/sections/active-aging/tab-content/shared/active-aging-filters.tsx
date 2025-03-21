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
import { CaseStatusFilter } from '@deps/components/dashboard/filters/case-status-filter';

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

    const caseStatusOptions: { label: string; displayText: string; value: Statuses }[] = [
        { label: 'In progress', displayText: 'In progress', value: Statuses.InProgress },
        { label: 'Not in good order', displayText: 'Not in good order', value: Statuses.Exception },
        { label: 'Not started', displayText: 'Not started', value: Statuses.NotStarted },
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
                <CaseStatusFilter caseStatus={caseStatus} handleChangeCallback={setCaseStatus} options={caseStatusOptions} />
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
