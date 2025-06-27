import { FC, useContext } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { TransactionTrendsContext } from '@deps/components/dashboard/sections/transaction-trends/context/transaction-trends-context';

export const TransactionTrendsHeader: FC = () => {
    const { transactionTrendsData, transactionTrendsDataFetching } = useContext(
        TransactionTrendsContext
    );

    const totalCaseCount = transactionTrendsData?.data
        ?.map((stat) => stat.count)
        .reduce((a, b) => a + b, 0);

    const totalCases = transactionTrendsDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>
                {totalCaseCount?.toLocaleString() || '0'} total cases
            </p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>
            {totalCaseCount?.toLocaleString() || '0'} total cases
        </p>
    );

    return (
        <ChartHeader
            title="Closed Case Counts"
            subtitle={totalCases}
            description={`Volume of closed cases over a selected time range, grouped by the top five case subtypes, carriers, distribution partners, or products.`}
        />
    );
};
