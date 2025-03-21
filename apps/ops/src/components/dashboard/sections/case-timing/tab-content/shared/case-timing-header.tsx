import { useContext } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { CaseTimingContext } from '@deps/components/dashboard/sections/case-timing/context/case-timing-context';

export const CaseTimingHeader = () => {
    const { caseTimingData, caseTimingDataFetching } = useContext(CaseTimingContext);

    const totalCaseCount = caseTimingData?.reduce((acc, val) => acc + val.count, 0);

    const totalCases = caseTimingDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
    );
    return <ChartHeader title="Median Case Processing Times" subtitle={totalCases} />;
};
