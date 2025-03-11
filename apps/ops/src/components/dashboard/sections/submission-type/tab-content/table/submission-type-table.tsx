import {
    FieldDataActive,
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
import { CaseTypeFilter, ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { SubmissionTypeContext } from '@deps/components/dashboard/sections/submission-type/context/submission-type-context';
import { startDates, TimeframeFilterOptions } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { DashboardStatsElementResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
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

enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

const generateCaseLink = (
    process: Processes | ExtendedProcesses | undefined,
    name: string,
    submissionMethod: string,
    timeframe: TimeframeFilterOptions,
    groupBy: GroupByOptions
) => {
    const method = submissionMethod === 'Electronic (E-App)' ? 'electronic' : 'paper';
    const carrierOrProduct =
        groupBy === GroupByOptions.ProductName ? 'productName' : groupBy === GroupByOptions.Carrier ? 'carrier' : 'brokerDealerName';
    const createdStartDate = startDates[timeframe];

    return `/cases?process=${
        process === 'all' ? '' : process
    }&${carrierOrProduct}=${name}&applicationType=${method}&createdDateStart=${createdStartDate}&caseStatus=${[
        Statuses.InProgress,
        Statuses.Exception,
        Statuses.NotStarted,
    ].join('&caseStatus=')}`;
};

export const SubmissionTypeTable = () => {
    const [offset, setOffset] = useState(0);
    const [sortOrder, setSortOrder] = useState(SortOrder.DESC);
    const [sortBy, setSortBy] = useState(SortByOptions.COUNT);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const {
        graphStats,
        timeframe,
        submissionVs,
        filter,
        setTimeframe,
        selectedProcess,
        setSubmissionVs,
        setSelectedProcess,
        graphStatsLoading,
        graphStatsFetching,
        graphStatsError,
    } = useContext(SubmissionTypeContext);

    const submissionVsOptions = [
        { label: 'Carrier', value: GroupByOptions.Carrier, disabled: filter.carrier?.length === 1 },
        { label: 'Product', value: GroupByOptions.ProductName },
        { label: 'Distribution Partner', value: GroupByOptions.BrokerDealerName },
    ];

    // Transform the data by flattening it
    const flattenedData = useMemo(() => {
        if (!graphStats?.data) return [];
        return flattenDashboardStats(graphStats.data, '');
    }, [graphStats?.data]);

    // Filter by search
    const searchedData = useMemo(() => {
        return flattenedData.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
    }, [flattenedData, searchText]);

    // Sorted data asc/desc
    // When sorting by the first column, we want to actually sort by parentElement since we flatten the data
    const sortedData = useMemo(() => {
        return [...searchedData].sort((a, b) => {
            if (sortBy === SortByOptions.NAME) {
                return sortOrder === SortOrder.ASC ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            } else if (sortBy === SortByOptions.SUBMISSION_METHOD) {
                return sortOrder === SortOrder.ASC
                    ? a.submissionMethod.localeCompare(b.submissionMethod)
                    : b.submissionMethod.localeCompare(a.submissionMethod);
            } else {
                return sortOrder === SortOrder.ASC ? a.count - b.count : b.count - a.count;
            }
        });
    }, [searchedData, sortBy, sortOrder]);

    // Create paginatedData from transformed data
    const paginatedData = useMemo(() => {
        return sortedData.slice(offset, offset + limit);
    }, [offset, limit, sortedData]);

    // This will trigger redefination of the memoized sortedData
    const handleSort = (column: SortByOptions) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
        } else {
            setSortBy(column);
            setSortOrder(SortOrder.ASC);
        }
    };

    const friendlySubmissionTypeName = useMemo(() => {
        switch (submissionVs) {
            case GroupByOptions.Carrier:
                return 'Carrier';
            case GroupByOptions.ProductName:
                return 'Product';
            case GroupByOptions.BrokerDealerName:
                return 'Distribution Partner';
            default:
        }
    }, [submissionVs]);

    //Pagination stuff
    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    //Send users back to page 1 if data for page doesnt exist after filters update
    useEffect(() => {
        if (offset > sortedData.length) {
            goToPage(1);
        }
    }, [sortedData, goToPage, offset]);

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
                <FieldDataActive
                    fieldSize="small"
                    placeholder={`Search by ${friendlySubmissionTypeName?.toLocaleLowerCase()} name`}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>
            <div className={sharedStyles.timeFilterContainer}>
                <div className="w-1/2 flex gap-2">
                    <Select
                        maxContentWidth
                        label="Group by"
                        className={sharedStyles.selectDropdowns}
                        options={submissionVsOptions}
                        value={submissionVs}
                        size={FieldSize.XS}
                        onChange={val => setSubmissionVs(val as GroupByOptions)}
                    />

                    <CaseTypeFilter
                        onValueChange={setSelectedProcess}
                        caseStatus={[Statuses.InProgress, Statuses.Exception, Statuses.NotStarted]}
                        defaultProcess={Processes.NewBusiness}
                        value={selectedProcess}
                    />
                </div>
                <div className="w-1/2">
                    <TimeFilter
                        defaultValue={timeframe}
                        onValueChange={val => setTimeframe(val as TimeframeFilterOptions)}
                        controlledTimeValue={timeframe}
                    />
                </div>
            </div>
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
                                        {friendlySubmissionTypeName} Name
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
                                    return (
                                        <TableRow key={`${item.name}-${item.submissionMethod}`}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.submissionMethod}</TableCell>
                                            <TableCell>{item.count}</TableCell>
                                            <TableCell>
                                                <NavElement
                                                    type={NavElementType.Link}
                                                    target="_blank"
                                                    href={generateCaseLink(
                                                        selectedProcess,
                                                        item.name,
                                                        item.submissionMethod,
                                                        timeframe,
                                                        submissionVs
                                                    )}
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
