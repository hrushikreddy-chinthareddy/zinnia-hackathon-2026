import { useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import {
    CaseTypeFilter,
    ExtendedProcesses,
} from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { Statuses } from '@deps/models/case/case';

import { IssueCountsByStatusContext } from './context/issue-counts-by-status-context';
import { ExceptionStatusFilter } from '../../filters/exception-status-filter';
import { IssueCategoryFilter } from '../../filters/issue-category-filter';

export const IssueCountsByStatusFilters = () => {
    const {
        setCategory,
        selectedProcess,
        setSelectedProcess,
        timeframeRadio,
        handleTimeframeRadioChange,
        timerange,
        handleRangeChange,
    } = useContext(IssueCountsByStatusContext);

    return (
        <div className={sharedStyles.filterContainer}>
            <div className={sharedStyles.filterGroup}>
                <IssueCategoryFilter
                    className={sharedStyles.filterItem}
                    onChange={setCategory}
                />
                <CaseTypeFilter
                    className={sharedStyles.filterItem}
                    onValueChange={setSelectedProcess}
                    caseStatus={[
                        Statuses.InProgress,
                        Statuses.Exception,
                        Statuses.NotStarted,
                        Statuses.Canceled,
                        Statuses.Completed,
                        Statuses.Inprogress,
                        Statuses.New,
                        Statuses.Overridden,
                        Statuses.Pending,
                        Statuses.Withdrawn,
                    ]}
                    defaultProcess={ExtendedProcesses.ALL}
                    value={selectedProcess}
                />
                <ExceptionStatusFilter className={sharedStyles.filterItem} />
            </div>
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
