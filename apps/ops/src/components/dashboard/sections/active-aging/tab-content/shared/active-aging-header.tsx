import { useContext } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';

import { ActiveAgingContext } from '../../context/active-aging-context';

export const ActiveAgingHeader = () => {
    const { activeAgingDataFetching, totalCaseCount } = useContext(ActiveAgingContext);

    const totalCases = activeAgingDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
    );

    return (
        <ChartHeader
            title="Active Aging"
            subtitle={totalCases}
            description="The duration of active cases, helping track case age and identify delays in processing."
        />
    );
};
