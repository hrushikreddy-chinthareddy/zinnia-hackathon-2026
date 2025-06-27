import { CaseCountGroupByEnum } from '@zinnia/api-types/types/analytics';
import { FC, useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { TransactionTrendsContext } from '../../context/transaction-trends-context';

export const TransactionTrendsFilters: FC = () => {
    const {
        setGroupBy,
        setSelectedProcess,
        filter,
        groupBy,
        selectedProcess,
        timerange,
        timeframeRadio,
        handleRangeChange,
        handleTimeframeRadioChange,
    } = useContext(TransactionTrendsContext);

    const groupByOptions = [
        { label: 'Case subtype', value: GroupByOptions.ProcessSubType },
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
        <div className={sharedStyles.filterContainer}>
            <div className="w-1/2 flex gap-4">
                <Select
                    maxContentWidth
                    label="Group by"
                    options={groupByOptions}
                    value={groupBy}
                    size={FieldSize.XS}
                    onChange={(val) => setGroupBy(val as CaseCountGroupByEnum)}
                />
                <CaseTypeFilter
                    onValueChange={setSelectedProcess}
                    defaultProcess={Processes.NewBusiness}
                    caseStatus={[Statuses.Completed]}
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
