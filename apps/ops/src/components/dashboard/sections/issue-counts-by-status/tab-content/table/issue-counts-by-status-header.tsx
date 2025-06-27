import { useContext } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { ExceptionStatus } from '@deps/queries/tanstack/dashboard/types';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { IssueCountsByStatusContext } from '../../context/issue-counts-by-status-context';

export const IssueCountsByStatusHeader = () => {
    const { issueCountsByStatusData, issueCountsByStatusDataFetching, exceptionStatus } = useContext(IssueCountsByStatusContext);
    const issueStatusText =
        exceptionStatus.includes(ExceptionStatus.UNRESOLVED) && exceptionStatus.includes(ExceptionStatus.RESOLVED)
            ? 'Issues'
            : exceptionStatus.includes(ExceptionStatus.UNRESOLVED)
            ? `${ExceptionStatus.UNRESOLVED} issues`
            : `${ExceptionStatus.RESOLVED} issues`;
    const totalCount = issueCountsByStatusData?.totalElements?.toLocaleString() || DEFAULT_ERROR_STRING;

    const totalIssues = issueCountsByStatusDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>
                {totalCount?.toLocaleString() || '0'} {issueStatusText}
            </p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>
            {totalCount?.toLocaleString() || '0'} {issueStatusText}
        </p>
    );

    return <ChartHeader title="Issue Counts" subtitle={totalIssues} />;
};
