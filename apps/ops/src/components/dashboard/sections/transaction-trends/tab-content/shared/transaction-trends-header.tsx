import { FC, useContext } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { TransactionTrendsContext } from '@deps/components/dashboard/sections/transaction-trends/context/transaction-trends-context';
import { friendlyGroupByName } from '@deps/components/dashboard/utils';
import { splitAndSentenceCase } from '@deps/helpers/dashboard/dashboard-helpers';

interface TransactionTrendsHeaderProps {
    chartView?: boolean;
}

export const TransactionTrendsHeader: FC<TransactionTrendsHeaderProps> = ({ chartView }) => {
    const { groupBy, transactionTrendsData, transactionTrendsDataFetching } = useContext(TransactionTrendsContext);

    const totalCaseCount = transactionTrendsData?.data?.map(stat => stat.count).reduce((a, b) => a + b, 0);

    const totalCases = transactionTrendsDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
    );

    return (
        <ChartHeader
            title="Transaction trends"
            subtitle={totalCases}
            description={`Top ${splitAndSentenceCase(friendlyGroupByName[groupBy])}s`}
        />
    );
};
