import { useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { CaseCountGroupByEnum } from '@zinnia/api-types/types/analytics';

import { SubmissionTypeContext } from '../../context/submission-type-context';

export const SubmissionTypeFilters = () => {
    const {
        timeframeRadio,
        submissionVs,
        handleTimeframeRadioChange,
        selectedProcess,
        setSubmissionVs,
        setSelectedProcess,
        filter,
        timerange,
        handleRangeChange,
    } = useContext(SubmissionTypeContext);

    const submissionVsOptions = [
        {
            label: 'Carrier',
            value: GroupByOptions.Carrier,
            disabled: filter.carrier?.length === 1,
        },
        { label: 'Product', value: GroupByOptions.ProductName },
        {
            label: 'Distribution partner',
            value: GroupByOptions.BrokerDealerName,
        },
    ];

    return (
        <div className={sharedStyles.timeFilterContainer}>
            <div className="w-1/2 flex gap-2">
                <Select
                    maxContentWidth
                    label="Group by"
                    options={submissionVsOptions}
                    value={submissionVs}
                    size={FieldSize.XS}
                    onChange={(val) =>
                        setSubmissionVs(val as CaseCountGroupByEnum)
                    }
                />

                <CaseTypeFilter
                    onValueChange={setSelectedProcess}
                    caseStatus={[
                        Statuses.InProgress,
                        Statuses.Exception,
                        Statuses.NotStarted,
                    ]}
                    defaultProcess={Processes.NewBusiness}
                    value={selectedProcess}
                />
            </div>
            <div className="w-1/2">
                <TimeFilter
                    defaultValue={timeframeRadio}
                    onRadioChange={(val) =>
                        handleTimeframeRadioChange(
                            val as TimeframeFilterOptions
                        )
                    }
                    controlledTimeValue={timeframeRadio}
                    timerange={timerange}
                    handleTimerangeChange={handleRangeChange}
                />
            </div>
        </div>
    );
};
