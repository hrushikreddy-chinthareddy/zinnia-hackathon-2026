import {
    FieldData,
    FieldSize,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@zinnia/bloom/components';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { SortableHeaderCell } from '@deps/components/dashboard/components/sortable-header-cell';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { SubmissionTypeContext } from '@deps/components/dashboard/sections/submission-type/context/submission-type-context';
import { SubmissionTypeFilters } from '@deps/components/dashboard/sections/submission-type/tab-content/shared/submission-type-filters';
import { friendlyGroupByName } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { toSentenceCase } from '@deps/utils/strings';
import { CaseCountOutputLevel1 } from '@zinnia/api-types/types/analytics';

import { SubmissionMethodTooltip } from '../../submission-type';

// Define the type for the flattened structure
interface FlattenedDashboardStatsElement {
    name: string;
    submissionMethod: string;
    count: number;
}

const flattenDashboardStats = (
    data: CaseCountOutputLevel1[],
    parentName: string
): FlattenedDashboardStatsElement[] => {
    return data.flatMap((item) => {
        if (item.values && item.values.length > 0) {
            return flattenDashboardStats(item.values, item.name);
        } else {
            return [
                {
                    name: parentName,
                    submissionMethod: item.name,
                    count: item.count,
                },
            ];
        }
    });
};

enum SortByOptions {
    NAME = 'name',
    SUBMISSION_METHOD = 'submissionMethod',
    COUNT = 'count',
}

export const SubmissionTypeTable = () => {
    const { t } = useTranslation();
    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const {
        graphStats,
        submissionVs,
        graphStatsLoading,
        graphStatsFetching,
        graphStatsError,
    } = useContext(SubmissionTypeContext);

    // Transform the data by flattening it
    const flattenedData = useMemo(() => {
        if (!graphStats?.data) return [];
        return flattenDashboardStats(graphStats.data, '');
    }, [graphStats?.data]);

    // Filter by search
    const searchedData = useMemo(() => {
        return flattenedData.filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [flattenedData, searchText]);

    const { handleSort, sortedData, sortOrder } = useTableOptions({
        sortByDefault: SortByOptions.COUNT,
        dataToSort: searchedData,
    });

    const [activeSortKey, setActiveSortKey] = useState<SortByOptions | null>(
        SortByOptions.COUNT
    );

    const onSort = useCallback(
        (sortKey: SortByOptions) => {
            setActiveSortKey(sortKey);
            handleSort(sortKey);
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

    // If sorted data updates, go back to page 1
    useEffect(() => {
        goToPage(1);
    }, [goToPage, sortedData]);

    const totalCaseCount = graphStats?.data
        ?.map((stat) => stat.count)
        .reduce((a, b) => a + b, 0);

    const totalCases = graphStatsFetching ? (
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
        <CardContainer>
            <ChartHeader
                title="Submission Method"
                subtitle={totalCases}
                titleToolTip={SubmissionMethodTooltip}
                description="The distribution of incoming case requests by submission method, comparing Electronic (E-App) and Paper submissions."
            />
            <div className={sharedStyles.searchContainer}>
                <FieldData
                    fieldSize={FieldSize.Small}
                    placeholder={`Search by ${friendlyGroupByName[
                        submissionVs
                    ]?.toLocaleLowerCase()}`}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <SubmissionTypeFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader
                    loading={graphStatsFetching || graphStatsLoading}
                >
                    {graphStatsError ? (
                        <ErrorMessage />
                    ) : searchedData?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeaderCell
                                        label={toSentenceCase(
                                            friendlyGroupByName[submissionVs]
                                        )}
                                        sortKey={SortByOptions.NAME}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.submissionMethod')}
                                        sortKey={
                                            SortByOptions.SUBMISSION_METHOD
                                        }
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.totalSubmissions')}
                                        sortKey={SortByOptions.COUNT}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    {/* <TableHeaderCell>Actions</TableHeaderCell> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => {
                                    // const link = generateCaseLink({
                                    //     process: selectedProcess,
                                    //     carrierOrProductName: item.name,
                                    //     submissionMethod: item.submissionMethod,
                                    //     startDate: timerange.from,
                                    //     endDate: timerange.to,
                                    //     status: [
                                    //         Statuses.InProgress,
                                    //         Statuses.Exception,
                                    //         Statuses.NotStarted,
                                    //     ],
                                    //     groupBy: submissionVs,
                                    //     carrier: filter.carrier,
                                    //     brokerDealer: filter.brokerDealerName,
                                    // });
                                    return (
                                        <TableRow
                                            key={`${item.name}-${item.submissionMethod}`}
                                        >
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                {item.submissionMethod}
                                            </TableCell>
                                            <TableCell>{item.count}</TableCell>
                                            {/* <TableCell>
                                                <NavElement
                                                    type={NavElementType.Link}
                                                    className="underline"
                                                    target="_blank"
                                                    href={link}
                                                    rel="noreferrer"
                                                >
                                                    View cases
                                                </NavElement>
                                            </TableCell> */}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                    {!graphStatsError &&
                        searchedData?.length > 0 &&
                        searchedData.length > limit && (
                            <div className={sharedStyles.paginationContainer}>
                                <Pagination
                                    limit={limit}
                                    offset={offset}
                                    total={searchedData?.length || 0}
                                    goToPage={goToPage}
                                />
                            </div>
                        )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
