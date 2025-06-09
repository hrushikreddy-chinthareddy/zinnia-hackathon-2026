import { toSentenceCase } from '@xd/utils/dist';
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
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TransactionTrendsContext } from '@deps/components/dashboard/sections/transaction-trends/context/transaction-trends-context';
import { TransactionTrendsFilters } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-filters';
import { TransactionTrendsHeader } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-header';
import { calculateAverage } from '@deps/components/dashboard/sections/transaction-trends/utils';
import { friendlyGroupByName, generateCaseLink } from '@deps/components/dashboard/utils';
import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { Statuses } from '@deps/models/case/case';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

enum SortByOptions {
    NAME = 'name',
    COUNT = 'count',
    AVERAGE = 'average',
}

enum TimeUnit {
    MONTHLY = 'Monthly',
    DAILY = 'Daily',
}

export const TransactionTrendsTable = () => {
    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const {
        timerange,
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
            average: calculateAverage(item.count, timerange),
        }));
    }, [timerange, transactionTrendsData?.data]);

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

    const dailyOrMonthly = useMemo(() => {
        const from = dayjs(timerange.from);
        const to = dayjs(timerange.to);

        const duration = dayjs.duration(to.diff(from));
        const daysDiff = duration.asDays();

        if (daysDiff < 30) {
            return TimeUnit.DAILY;
        }
        return TimeUnit.MONTHLY;
    }, [timerange.to, timerange.from]);

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
                    placeholder={`Search by ${friendlyGroupByName[groupBy]?.toLocaleLowerCase()}`}
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
                                        {toSentenceCase(friendlyGroupByName[groupBy])}
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
                                        {dailyOrMonthly} average
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
                                    const link = generateCaseLink({
                                        process: selectedProcess,
                                        carrierOrProductName: item.name,
                                        startDate: timerange.from,
                                        endDate: timerange.to,
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
