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
import {
    friendlyGroupByName,
    generateCaseLink,
    getNumberOfDaysInTimeframe,
    getNumberOfMonthsInTimeframe,
    startDates,
    TimeframeFilterOptions,
} from '@deps/components/dashboard/utils';
import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { Statuses } from '@deps/models/case/case';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import { TransactionTrendsContext } from '../../context/transaction-trends-context';
import { TransactionTrendsFilters } from '../shared/transaction-trends-filters';
import { TransactionTrendsHeader } from '../shared/transaction-trends-header';

enum SortByOptions {
    NAME = 'name',
    COUNT = 'count',
    AVERAGE = 'average',
}

const calculateAverage = (count: number, timeframe: TimeframeFilterOptions) => {
    if (timeframe === TimeframeFilterOptions.Last1Month || timeframe === TimeframeFilterOptions.LastWeek) {
        const numberOfDays = getNumberOfDaysInTimeframe(timeframe);
        return Math.round(count / numberOfDays);
    }

    const numberOfMonths = getNumberOfMonthsInTimeframe(timeframe);
    return Math.round(count / numberOfMonths);
};

export const TransactionTrendsTable = () => {
    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const {
        timeframe,
        selectedProcess,
        filter,
        groupBy,
        transactionTrendsData,
        transactionTrendsDataFetching,
        transactionTrendsDataError,
    } = useContext(TransactionTrendsContext);

    const dataWithMonthlyAverage = useMemo(() => {
        return transactionTrendsData?.data?.map(item => ({
            ...item,
            average: calculateAverage(item.count, timeframe),
        }));
    }, [timeframe, transactionTrendsData?.data]);

    // Filter by search
    const searchedData = useMemo(() => {
        return dataWithMonthlyAverage?.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase())) || [];
    }, [dataWithMonthlyAverage, searchText]);

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

    return (
        <CardContainer>
            <TransactionTrendsHeader />
            <div className={sharedStyles.searchContainer}>
                <FieldData
                    fieldSize={FieldSize.Small}
                    placeholder={`Search by ${friendlyGroupByName[groupBy]?.toLocaleLowerCase()} name`}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>
            <TransactionTrendsFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader loading={transactionTrendsDataFetching}>
                    {transactionTrendsDataError ? (
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
                                        {friendlyGroupByName[groupBy]} Name
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell onClick={() => handleSort(SortByOptions.COUNT)} sortable>
                                        Total cases
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell onClick={() => handleSort(SortByOptions.AVERAGE)} sortable>
                                        {timeframe === TimeframeFilterOptions.LastWeek || timeframe === TimeframeFilterOptions.Last1Month
                                            ? 'Daily'
                                            : 'Monthly'}{' '}
                                        average
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
                                {paginatedData.map((item, index) => {
                                    const startDate = startDates[timeframe];

                                    const link = generateCaseLink({
                                        process: selectedProcess,
                                        carrierOrProductName: item.name,
                                        startDate,
                                        status: [Statuses.Completed],
                                        groupBy,
                                        carrier: filter.carrier,
                                        brokerDealer: filter.brokerDealerName,
                                    });
                                    return (
                                        <TableRow key={`${item.name}-${index}`}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.count.toLocaleString()}</TableCell>
                                            <TableCell>{item.average.toLocaleString()}</TableCell>
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
                    {!transactionTrendsDataFetching && searchedData?.length > 0 && searchedData.length > limit && (
                        <div className={sharedStyles.paginationContainer}>
                            <Pagination limit={limit} offset={offset} total={searchedData?.length || 0} goToPage={goToPage} />
                        </div>
                    )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
