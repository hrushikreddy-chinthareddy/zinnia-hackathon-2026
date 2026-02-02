import {
    FieldData,
    FieldSize,
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
import { useTranslation } from 'react-i18next';

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { SortableHeaderCell } from '@deps/components/dashboard/components/sortable-header-cell';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TransactionTrendsContext } from '@deps/components/dashboard/sections/transaction-trends/context/transaction-trends-context';
import { TransactionTrendsFilters } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-filters';
import { TransactionTrendsHeader } from '@deps/components/dashboard/sections/transaction-trends/tab-content/shared/transaction-trends-header';
import { calculateAverage } from '@deps/components/dashboard/sections/transaction-trends/utils';
import {
    friendlyGroupByName,
    generateCaseLink,
} from '@deps/components/dashboard/utils';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { Statuses } from '@deps/models/case/case';
import { toSentenceCase } from '@deps/utils/strings';

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
    const { t } = useTranslation();
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
        return transactionTrendsData?.data?.map((item) => ({
            ...item,
            average: calculateAverage(item.count, timerange),
        }));
    }, [timerange, transactionTrendsData?.data]);

    // Filter by search
    const searchedData = useMemo(() => {
        return (
            dataWithMonthlyAverage?.filter((item) =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
            ) || []
        );
    }, [dataWithMonthlyAverage, searchText]);

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

    const periodLabel =
        dailyOrMonthly === TimeUnit.DAILY
            ? t('allFields.daily')
            : t('allFields.monthly');

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
                    placeholder={`Search by ${friendlyGroupByName[
                        groupBy
                    ]?.toLocaleLowerCase()}`}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <TransactionTrendsFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader loading={transactionTrendsDataFetching}>
                    {transactionTrendsDataError ? (
                        <ErrorMessage />
                    ) : searchedData?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeaderCell
                                        label={toSentenceCase(
                                            friendlyGroupByName[groupBy]
                                        )}
                                        sortKey={SortByOptions.NAME}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.totalCases')}
                                        sortKey={SortByOptions.COUNT}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.periodAverage', {
                                            period: periodLabel,
                                        })}
                                        sortKey={SortByOptions.AVERAGE}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <TableHeaderCell>
                                        {t('allFields.actions')}
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item, index) => {
                                    const link = generateCaseLink({
                                        process: selectedProcess,
                                        carrierOrProductName: item.name,
                                        updatedDateStart: timerange.from,
                                        updatedDateEnd: timerange.to,
                                        status: [
                                            Statuses.Completed,
                                            Statuses.Canceled,
                                        ],
                                        groupBy,
                                        carrier: filter.carrier,
                                        brokerDealer: filter.brokerDealerName,
                                    });
                                    return (
                                        <TableRow key={`${item.name}-${index}`}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                {item.count.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {item.average.toLocaleString()}
                                            </TableCell>
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
                    {!transactionTrendsDataFetching &&
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
