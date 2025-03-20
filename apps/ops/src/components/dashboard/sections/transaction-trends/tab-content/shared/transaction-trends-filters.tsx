import { FC, useContext } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { TransactionTrendsContext } from '../../context/transaction-trends-context';
import { TransactionTrendsTimeframe } from '../../utils';

export const TransactionTrendsFilters: FC = () => {
    const { setTimeframe, setGroupBy, setSelectedProcess, timeframe, filter, groupBy, selectedProcess } =
        useContext(TransactionTrendsContext);

    const groupByOptions = [
        { label: 'Sub process', value: GroupByOptions.ProcessSubType },
        { label: 'Carrier', value: GroupByOptions.Carrier, disabled: filter.carrier?.length === 1 },
        { label: 'Product', value: GroupByOptions.ProductName },
        { label: 'Distribution Partner', value: GroupByOptions.BrokerDealerName },
    ];

    return (
        <div className={sharedStyles.filterContainer}>
            <div className="w-1/2 flex gap-4">
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
                    defaultProcess={Processes.NewBusiness}
                    caseStatus={[Statuses.Completed]}
                    value={selectedProcess}
                />
            </div>
            <div className="w-1/2">
                <TimeFilter
                    defaultValue={timeframe}
                    onValueChange={val => setTimeframe(val as TransactionTrendsTimeframe)}
                    timeframeOptions={TransactionTrendsTimeframe}
                    controlledTimeValue={timeframe}
                />
            </div>
        </div>
    );
};
