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

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
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

import { ActiveAgingContext } from '../../context/active-aging-context';
import { calculateEndDate, startDates } from '../../utils';
import { ActiveAgingFilters } from '../shared/active-aging-filters';
import { ActiveAgingHeader } from '../shared/active-aging-header';

enum SortByOptions {
    NAME = 'name',
    TOTAL = 'total',
}

export const ActiveAgingTable = () => {
    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const {
        timeframe,
        activeAgingDataFetching,
        activeAgingDataLoading,
        activeAgingDataError,
        groupBy,
        timeRangeData,
        selectedProcess,
        filter,
    } = useContext(ActiveAgingContext);

    const dataByTimeframe = useMemo(() => {
        return timeRangeData?.[timeframe].data || [];
    }, [timeRangeData, timeframe]);

    // Filter by search
    const searchedData = useMemo(() => {
        return dataByTimeframe.filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [dataByTimeframe, searchText]);

    const { handleSort, sortedData } = useTableOptions({
        sortByDefault: SortByOptions.TOTAL,
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

    const generateExpandableContent = useCallback(
        (name: string, countByDay: { [key: string]: number }) => {
            return Object.keys(countByDay)
                .reverse()
                .map((key) => {
                    const startDate = dayjs(key);
                    const daysActive = dayjs().diff(startDate, 'day');
                    return (
                        <TableRow key={key}>
                            <TableCell aria-label={name}></TableCell>
                            <TableCell>{countByDay[key]}</TableCell>
                            <TableCell>{daysActive} Days</TableCell>
                            <TableCell>
                                <NavElement
                                    type={NavElementType.Link}
                                    target="_blank"
                                    className="underline"
                                    href={generateCaseLink({
                                        process: selectedProcess,
                                        carrierOrProductName: name,
                                        createdDateStart: key,
                                        createdDateEnd: key,
                                        groupBy,
                                        status: filter.caseStatus,
                                        brokerDealer: filter.brokerDealerName,
                                        carrier: filter.carrier,
                                    })}
                                    rel="noreferrer"
                                >
                                    View cases
                                </NavElement>
                            </TableCell>
                        </TableRow>
                    );
                });
        },
        [
            filter.brokerDealerName,
            filter.carrier,
            filter.caseStatus,
            groupBy,
            selectedProcess,
        ]
    );

    return (
        <CardContainer>
            <ActiveAgingHeader />
            <div className={sharedStyles.searchContainer}>
                <FieldData
                    fieldSize={FieldSize.Small}
                    placeholder={`Search by ${friendlyGroupByName[
                        groupBy
                    ]?.toLocaleLowerCase()}`}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <ActiveAgingFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader
                    loading={activeAgingDataFetching || activeAgingDataLoading}
                >
                    {activeAgingDataError ? (
                        <ErrorMessage />
                    ) : searchedData?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell
                                        onClick={() =>
                                            handleSort(SortByOptions.NAME)
                                        }
                                        sortable
                                    >
                                        {toSentenceCase(
                                            friendlyGroupByName[groupBy]
                                        )}
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        onClick={() =>
                                            handleSort(SortByOptions.TOTAL)
                                        }
                                        sortable
                                    >
                                        Total submissions
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        Days active
                                    </TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => {
                                    const createdDateStart =
                                        startDates[timeframe];
                                    const createdDateEnd =
                                        calculateEndDate(timeframe);
                                    const link = generateCaseLink({
                                        process: selectedProcess,
                                        carrierOrProductName: item.name,
                                        createdDateStart,
                                        createdDateEnd,
                                        groupBy,
                                        carrier: filter.carrier,
                                        brokerDealer: filter.brokerDealerName,
                                        status: filter.caseStatus,
                                    });
                                    return (
                                        <TableRow
                                            key={`${item.name}-${item.count}`}
                                            isExpandable
                                            showChevron
                                            expandedContent={generateExpandableContent(
                                                item.name,
                                                item.countByDay
                                            )}
                                        >
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.total}</TableCell>
                                            <TableCell>{timeframe}</TableCell>
                                            <TableCell>
                                                <NavElement
                                                    type={NavElementType.Link}
                                                    target="_blank"
                                                    className="underline"
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
                    {!activeAgingDataError && searchedData?.length > 0 && (
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
