import { FC, useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseStatusFilter } from '@deps/components/dashboard/filters/case-status-filter';
import {
    CaseTypeFilter,
    ExtendedProcesses,
} from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { ActiveAgingContext } from '@deps/components/dashboard/sections/active-aging/context/active-aging-context';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Statuses } from '@deps/models/case/case';
import { CaseCountGroupByEnum } from '@zinnia/api-types/types/analytics';

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
        {
            label: 'Carrier',
            value: CaseCountGroupByEnum.CARRIER,
            disabled: filter.carrier?.length === 1,
        },
        { label: 'Case subtype', value: CaseCountGroupByEnum.PROCESS_SUB_TYPE },
        {
            label: 'Distribution partner',
            value: CaseCountGroupByEnum.BROKER_DEALER_NAME,
        },
    ];

    const caseStatusOptions: {
        label: string;
        displayText: string;
        value: Statuses;
    }[] = [
        {
            label: 'In progress',
            displayText: 'In progress',
            value: Statuses.InProgress,
        },
        {
            label: 'Not in good order',
            displayText: 'Not in good order',
            value: Statuses.Exception,
        },
        {
            label: 'Not started',
            displayText: 'Not started',
            value: Statuses.NotStarted,
        },
    ];

    return (
        <div className={sharedStyles.filterContainer}>
            <div className={sharedStyles.filterGroup}>
                <Select
                    className={sharedStyles.filterItem}
                    label="Group by"
                    options={groupByOptions}
                    value={groupBy}
                    size={FieldSize.XS}
                    onChange={(val) => setGroupBy(val as CaseCountGroupByEnum)}
                />

                <CaseTypeFilter
                    className={sharedStyles.filterItem}
                    onValueChange={setSelectedProcess}
                    caseStatus={Object.keys(caseStatus) as Statuses[]}
                    defaultProcess={ExtendedProcesses.ALL}
                    value={selectedProcess}
                />
                <CaseStatusFilter
                    caseStatus={caseStatus}
                    handleChangeCallback={setCaseStatus}
                    options={caseStatusOptions}
                />
            </div>
            <div>
                <TimeFilter
                    defaultValue={timeframe}
                    timeframeOptions={ActiveAgingTimeRange}
                    onRadioChange={(val) =>
                        setTimeframe(val as ActiveAgingTimeRange)
                    }
                    controlledTimeValue={timeframe}
                    timerange={controlledTimeRangeText}
                />
            </div>
        </div>
    );
};
