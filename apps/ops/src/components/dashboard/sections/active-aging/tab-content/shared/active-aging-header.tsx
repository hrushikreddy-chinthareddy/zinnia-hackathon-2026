import { useContext } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';

import { ActiveAgingContext } from '../../context/active-aging-context';

export const ActiveAgingHeader = () => {
    const { activeAgingDataFetching, totalCaseCount } =
        useContext(ActiveAgingContext);

    const totalCases = activeAgingDataFetching ? (
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
            title="Aging Cases"
            subtitle={totalCases}
            description="Open case duration by carrier, product, or distribution partner."
        />
    );
};
