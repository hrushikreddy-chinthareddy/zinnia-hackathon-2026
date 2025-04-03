import {
    FieldData,
    FieldSize,
    Icon,
    IconType,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { SubmissionTypeContext } from '@deps/components/dashboard/sections/submission-type/context/submission-type-context';
import { SubmissionTypeFilters } from '@deps/components/dashboard/sections/submission-type/tab-content/shared/submission-type-filters';
import { friendlyGroupByName, generateCaseLink } from '@deps/components/dashboard/utils';
import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { DashboardStatsElementResponse, Statuses } from '@deps/models/case/case';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import { SubmissionMethodTooltip } from '../../submission-type';

// Define the type for the flattened structure
interface FlattenedDashboardStatsElement {
    name: string;
    submissionMethod: string;
    count: number;
}

// We render out the table view of these stats a bit differently than the chart.
// Since we're returning arrays of carriers with nested data for the submission method,
// we need to flatten the list of submission methods out and associate them with the carrier
// Carrier | Method | Count
const flattenDashboardStats = (data: DashboardStatsElementResponse[], parentName: string): FlattenedDashboardStatsElement[] => {
    return data.flatMap(item => {
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
    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const { graphStats, timerange, submissionVs, selectedProcess, graphStatsLoading, graphStatsFetching, graphStatsError, filter } =
        useContext(SubmissionTypeContext);

    // Transform the data by flattening it
    const flattenedData = useMemo(() => {
        if (!graphStats?.data) return [];
        return flattenDashboardStats(graphStats.data, '');
    }, [graphStats?.data]);

    // Filter by search
    const searchedData = useMemo(() => {
        return flattenedData.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
    }, [flattenedData, searchText]);

    const { handleSort, sortedData } = useTableOptions({
        sortByDefault: SortByOptions.COUNT,
        dataToSort: searchedData,
    });

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

    const totalCaseCount = graphStats?.data?.map(stat => stat.count).reduce((a, b) => a + b, 0);

    const totalCases = graphStatsFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
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
                    placeholder={`Search by ${friendlyGroupByName[submissionVs]?.toLocaleLowerCase()} name`}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>
            <SubmissionTypeFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader loading={graphStatsFetching || graphStatsLoading}>
                    {graphStatsError ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {'Something went wrong fetching the application types, please try again by refreshing the page'}
                            </Typography>
                        </div>
                    ) : searchedData?.length === 0 ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {'There is no data for this selection'}
                            </Typography>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell onClick={() => handleSort(SortByOptions.NAME)} sortable>
                                        {friendlyGroupByName[submissionVs]} Name
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell onClick={() => handleSort(SortByOptions.SUBMISSION_METHOD)} sortable>
                                        Submission Method
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell onClick={() => handleSort(SortByOptions.COUNT)} sortable>
                                        Total Submissions
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map(item => {
                                    const link = generateCaseLink({
                                        process: selectedProcess,
                                        carrierOrProductName: item.name,
                                        submissionMethod: item.submissionMethod,
                                        startDate: timerange.from,
                                        endDate: timerange.to,
                                        status: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
                                        groupBy: submissionVs,
                                        carrier: filter.carrier,
                                        brokerDealer: filter.brokerDealerName,
                                    });
                                    return (
                                        <TableRow key={`${item.name}-${item.submissionMethod}`}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.submissionMethod}</TableCell>
                                            <TableCell>{item.count}</TableCell>
                                            <TableCell>
                                                <NavElement
                                                    type={NavElementType.Link}
                                                    variant={NavElementVariant.Secondary}
                                                    className="underline"
                                                    target="_blank"
                                                    href={link}
                                                    rel="noreferrer"
                                                >
                                                    View cases
                                                </NavElement>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                    {!graphStatsError && searchedData?.length > 0 && searchedData.length > limit && (
                        <div className={sharedStyles.paginationContainer}>
                            <Pagination limit={limit} offset={offset} total={searchedData?.length || 0} goToPage={goToPage} />
                        </div>
                    )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
