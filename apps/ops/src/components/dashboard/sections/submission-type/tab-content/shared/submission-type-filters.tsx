import { useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { SubmissionTypeContext } from '../../context/submission-type-context';

export const SubmissionTypeFilters = () => {
    const { timeframe, submissionVs, setTimeframe, selectedProcess, setSubmissionVs, setSelectedProcess, filter } =
        useContext(SubmissionTypeContext);

    const submissionVsOptions = [
        { label: 'Carrier', value: GroupByOptions.Carrier, disabled: filter.carrier?.length === 1 },
        { label: 'Product', value: GroupByOptions.ProductName },
        { label: 'Distribution Partner', value: GroupByOptions.BrokerDealerName },
    ];

    return (
        <div className={sharedStyles.timeFilterContainer}>
            <div className="w-1/2 flex gap-2">
                <Select
                    maxContentWidth
                    label="Group by"
                    className={sharedStyles.selectDropdowns}
                    options={submissionVsOptions}
                    value={submissionVs}
                    size={FieldSize.XS}
                    onChange={val => setSubmissionVs(val as GroupByOptions)}
                />

                <CaseTypeFilter
                    onValueChange={setSelectedProcess}
                    caseStatus={[Statuses.InProgress, Statuses.Exception, Statuses.NotStarted]}
                    defaultProcess={Processes.NewBusiness}
                    value={selectedProcess}
                />
            </div>
            <div className="w-1/2">
                <TimeFilter
                    defaultValue={timeframe}
                    onValueChange={val => setTimeframe(val as TimeframeFilterOptions)}
                    controlledTimeValue={timeframe}
                />
            </div>
        </div>
    );
};
