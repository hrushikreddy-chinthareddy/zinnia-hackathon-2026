import { useContext } from 'react';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import { IssueCountsByStatusContext } from '../../context/issue-counts-by-status-context';
import { getIssueStatusText } from '../../utlis';

export const IssueCountsByStatusHeader = () => {
    const {
        issueCountsByStatusData,
        issueCountsByStatusDataFetching,
        exceptionStatus,
    } = useContext(IssueCountsByStatusContext);

    const issueStatusText = getIssueStatusText(exceptionStatus);
    const totalCount =
        issueCountsByStatusData?.totalElements?.toLocaleString() ||
        DEFAULT_ERROR_STRING;

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
