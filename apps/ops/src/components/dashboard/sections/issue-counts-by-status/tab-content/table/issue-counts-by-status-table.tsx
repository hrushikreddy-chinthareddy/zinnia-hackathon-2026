import {
    Pagination,
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    FieldData,
    FieldSize,
    TableBody,
    TableCell,
    PopoverPlacement,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { SortableHeaderCell } from '@deps/components/dashboard/components/sortable-header-cell';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { Columns, DownloadCSV } from '@deps/components/dashboard/download-csv';
import {
    defaultDateFormat,
    generateCaseLink,
} from '@deps/components/dashboard/utils';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Tooltip from '@deps/components/tooltip/tooltip';
import CardContainer from '@deps/containers/card-container/card-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import {
    capitalizeAfterPeriod,
    toSentenceCase,
} from '@deps/helpers/string.helpers';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { ExceptionStatus } from '@deps/queries/tanstack/dashboard/types';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { ExceptionCountOutputLevel1 } from '@zinnia/api-types/types/analytics';

import { IssueCountsByStatusHeader } from './issue-counts-by-status-header';
import { IssueCountsByStatusContext } from '../../context/issue-counts-by-status-context';
import { IssueCountsByStatusFilters } from '../../issue-counts-by-status-filter';

export interface FlattenedDashboardStatsElement {
    category: string;
    reason: string;
    details: string;
    count: number;
}

export const IssueCountsByStatusTable = () => {
    const { t } = useTranslation();
    const {
        issueCountsByStatusData,
        issueCountsByStatusDataError,
        issueCountsByStatusDataLoading,
        issueCountsByStatusDataFetching,
        exceptionStatus,
        timerange,
        filter,
        selectedProcess,
    } = useContext(IssueCountsByStatusContext);

    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const { featureFlags } = useOptimizely();

    const flattenDashboardStats = useCallback(
        (
            data: ExceptionCountOutputLevel1[],
            detailedReason?: string,
            reason?: string
        ): FlattenedDashboardStatsElement[] => {
            return data.flatMap((item) => {
                if (item.values && item.values.length > 0) {
                    if (!detailedReason) {
                        return flattenDashboardStats(
                            item.values,
                            item.name,
                            reason
                        );
                    } else if (!reason) {
                        return flattenDashboardStats(
                            item.values,
                            detailedReason,
                            item.name
                        );
                    } else {
                        return flattenDashboardStats(
                            item.values,
                            detailedReason,
                            reason
                        );
                    }
                } else {
                    return [
                        {
                            category: item.name,
                            reason: reason ?? '',
                            details: detailedReason ?? '',
                            count: item.count,
                        },
                    ];
                }
            });
        },
        []
    );

    enum SortByOptions {
        CATEGORY = 'category',
        REASON = 'reason',
        DETAILS = 'details',
        COUNT = 'count',
    }

    const flattenedData = useMemo(() => {
        if (!issueCountsByStatusData?.data) return [];
        return flattenDashboardStats(issueCountsByStatusData?.data);
    }, [issueCountsByStatusData?.data, flattenDashboardStats]);

    const searchedData = useMemo(() => {
        return flattenedData.filter(
            (item) =>
                item.category
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchText.toLowerCase()) ||
                item.details.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [flattenedData, searchText]);

    const { handleSort, sortedData, sortOrder } = useTableOptions({
        sortByDefault: SortByOptions.COUNT,
        dataToSort: searchedData,
    });

    const sortDirection = sortOrder; // 'asc' | 'desc'

    const [activeSort, setActiveSort] = useState<SortByOptions | null>(
        SortByOptions.COUNT
    );

    const onSort = useCallback(
        (sortBy: SortByOptions) => {
            setActiveSort(sortBy);
            handleSort(sortBy);
        },
        [handleSort]
    );

    // Create paginatedData from transformed data
    const paginatedData = useMemo(() => {
        return sortedData.slice(offset, offset + limit);
    }, [offset, limit, sortedData]);

    //Pagination stuff
    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    useEffect(() => {
        goToPage(1);
    }, [goToPage, sortedData]);

    const start = offset + 1;
    const end = Math.min(offset + limit, searchedData.length);

    const csvFileName =
        exceptionStatus.includes(ExceptionStatus.UNRESOLVED) &&
        exceptionStatus.includes(ExceptionStatus.RESOLVED)
            ? 'Unresolved-Resolved'
            : exceptionStatus.includes(ExceptionStatus.UNRESOLVED)
            ? ExceptionStatus.UNRESOLVED
            : ExceptionStatus.RESOLVED;

    const columnsForCSV: Columns[] = [
        { label: 'Category', key: 'category' },
        { label: 'Reason', key: 'reason' },
        { label: 'Details', key: 'details' },
        { label: 'Total', key: 'count' },
    ];
    const isViewCasesEnabled =
        featureFlags[FEATURE_FLAGS.ENABLE_ISSUE_COUNT_VIEW_CASES] &&
        featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_CASE];

    return (
        <CardContainer>
            <div className="flex justify-between items-center">
                <IssueCountsByStatusHeader />
                <DownloadCSV
                    sortedData={sortedData}
                    csvFileName={`${csvFileName} Issue Counts ${dayjs(
                        timerange.from
                    ).format(defaultDateFormat)} to ${dayjs(
                        timerange.to
                    ).format(defaultDateFormat)}`}
                    columns={columnsForCSV}
                />
            </div>
            <div className={sharedStyles.searchContainer}>
                <FieldData
                    fieldSize={FieldSize.Small}
                    placeholder={`Search for an issue`}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <IssueCountsByStatusFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader
                    loading={
                        issueCountsByStatusDataLoading ||
                        issueCountsByStatusDataFetching
                    }
                >
                    {issueCountsByStatusDataError ? (
                        <ErrorMessage />
                    ) : searchedData?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeaderCell
                                        label={t('allFields.category')}
                                        sortKey={SortByOptions.CATEGORY}
                                        activeSortKey={activeSort}
                                        onSort={onSort}
                                        sortOrder={sortDirection}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.reason')}
                                        sortKey={SortByOptions.REASON}
                                        activeSortKey={activeSort}
                                        onSort={onSort}
                                        sortOrder={sortDirection}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.details')}
                                        sortKey={SortByOptions.DETAILS}
                                        activeSortKey={activeSort}
                                        onSort={onSort}
                                        sortOrder={sortDirection}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.total')}
                                        sortKey={SortByOptions.COUNT}
                                        activeSortKey={activeSort}
                                        onSort={onSort}
                                        sortOrder={sortDirection}
                                    />
                                    {isViewCasesEnabled && (
                                        <TableHeaderCell>
                                            {t('allFields.actions')}
                                        </TableHeaderCell>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => {
                                    const link = generateCaseLink({
                                        process: selectedProcess,
                                        createdDateStart: timerange.from,
                                        createdDateEnd: timerange.to,
                                        issueStatus: exceptionStatus,
                                        carrier: filter.carrier,
                                        brokerDealer: filter.brokerDealerName,
                                        category: item.category,
                                        reason: item.reason,
                                        detailedReason: item.details,
                                    });
                                    return (
                                        <TableRow
                                            key={`${item.category}-${item.reason}-${item.details}`}
                                        >
                                            <TableCell>
                                                <Tooltip
                                                    body={
                                                        toSentenceCase(
                                                            item.category
                                                        ) || 'Issue'
                                                    }
                                                    placement={
                                                        PopoverPlacement.TopRight
                                                    }
                                                >
                                                    <div className="text-left">
                                                        {toSentenceCase(
                                                            item.category
                                                        ) || 'Issue'}
                                                    </div>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    body={toSentenceCase(
                                                        item.reason ||
                                                            item.category
                                                    )}
                                                    placement={
                                                        PopoverPlacement.TopRight
                                                    }
                                                >
                                                    <div className="text-left">
                                                        {toSentenceCase(
                                                            item.reason ||
                                                                item.category
                                                        )}
                                                    </div>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    body={
                                                        capitalizeAfterPeriod(
                                                            item.details
                                                        ) ||
                                                        capitalizeAfterPeriod(
                                                            item.reason
                                                        )
                                                    }
                                                    placement={
                                                        PopoverPlacement.TopRight
                                                    }
                                                >
                                                    <div className="text-left">
                                                        {capitalizeAfterPeriod(
                                                            item.details
                                                        ) ||
                                                            capitalizeAfterPeriod(
                                                                item.reason
                                                            )}
                                                    </div>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    body={item.count?.toLocaleString()}
                                                    placement={
                                                        PopoverPlacement.TopRight
                                                    }
                                                >
                                                    {item.count?.toLocaleString()}
                                                </Tooltip>
                                            </TableCell>
                                            {isViewCasesEnabled && (
                                                <TableCell>
                                                    <NavElement
                                                        type={
                                                            NavElementType.Link
                                                        }
                                                        className="underline"
                                                        target="_blank"
                                                        href={link}
                                                        rel="noreferrer"
                                                    >
                                                        View cases
                                                    </NavElement>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                    {!issueCountsByStatusDataError &&
                        searchedData?.length > 0 &&
                        searchedData.length > limit && (
                            <div className={sharedStyles.paginationContainer}>
                                <div className={sharedStyles.paginationRow}>
                                    <div style={{ flex: 1 }} />
                                    <div
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Pagination
                                            limit={limit}
                                            offset={offset}
                                            total={searchedData?.length || 0}
                                            goToPage={goToPage}
                                        />
                                    </div>
                                    <div
                                        style={{ flex: 1, textAlign: 'right' }}
                                    >
                                        {start}-{end} of {searchedData?.length}
                                    </div>
                                </div>
                            </div>
                        )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
