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
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { SortableHeaderCell } from '@deps/components/dashboard/components/sortable-header-cell';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTimingContext } from '@deps/components/dashboard/sections/case-timing/context/case-timing-context';
import { CaseTimingFilters } from '@deps/components/dashboard/sections/case-timing/tab-content/shared/case-timing-filters';
import { CaseTimingHeader } from '@deps/components/dashboard/sections/case-timing/tab-content/shared/case-timing-header';
import { generateTableTimeRange } from '@deps/components/dashboard/sections/case-timing/utils';
import { generateCaseLink } from '@deps/components/dashboard/utils';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import {
    SortOrder,
    useTableOptions,
} from '@deps/hooks/dashboard/useTableOptions';
import { Statuses } from '@deps/models/case/case';
import { CaseCountGroupByEnum } from '@zinnia/api-types/types/analytics';

enum SortByOptions {
    NAME = 'name',
    SECOND_MEDIAN = 'secondMedian',
    SECOND_HIGH = 'secondHigh',
    SECOND_LOW = 'secondLow',
    COUNT = 'count',
}

export const CaseTimingTable = () => {
    const { t } = useTranslation();
    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const limit = 10;

    const {
        timerange,
        caseTimingData,
        selectedProcess,
        caseTimingDataError,
        caseTimingDataFetching,
        filter,
    } = useContext(CaseTimingContext);

    // Filter by search
    const searchedData = useMemo(() => {
        return (
            caseTimingData?.filter((item) =>
                item.name.toLowerCase().includes(searchText.toLowerCase())
            ) || []
        );
    }, [caseTimingData, searchText]);

    const { handleSort, sortedData, sortOrder } = useTableOptions({
        sortByDefault: SortByOptions.SECOND_MEDIAN,
        defaultSortOrder: SortOrder.ASC,
        dataToSort: searchedData,
    });

    const [activeSortKey, setActiveSortKey] = useState<SortByOptions | null>(
        SortByOptions.SECOND_MEDIAN
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

    return (
        <CardContainer>
            <CaseTimingHeader />

            <div className={sharedStyles.searchContainer}>
                <FieldData
                    fieldSize={FieldSize.Small}
                    placeholder={`Search by case subtype`}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <CaseTimingFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader loading={caseTimingDataFetching}>
                    {caseTimingDataError ? (
                        <ErrorMessage />
                    ) : searchedData?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeaderCell
                                        label={t('allFields.caseSubtype')}
                                        sortKey={SortByOptions.NAME}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t(
                                            'allFields.medianProcessingTime'
                                        )}
                                        sortKey={SortByOptions.SECOND_MEDIAN}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.maxProcessingTime')}
                                        sortKey={SortByOptions.SECOND_HIGH}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t('allFields.minProcessingTime')}
                                        sortKey={SortByOptions.SECOND_LOW}
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
                                    <TableHeaderCell>
                                        {t('allFields.actions')}
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => {
                                    return (
                                        <TableRow
                                            key={`${item.name}-${item.key}`}
                                        >
                                            <TableCell
                                                className={
                                                    sharedStyles.tableCellMaxWidth
                                                }
                                            >
                                                {item.name}
                                            </TableCell>
                                            <TableCell>
                                                {generateTableTimeRange(
                                                    item.secondMedian
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {generateTableTimeRange(
                                                    item.secondHigh
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {generateTableTimeRange(
                                                    item.secondLow
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.count.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <NavElement
                                                    type={NavElementType.Link}
                                                    target="_blank"
                                                    className="underline"
                                                    href={generateCaseLink({
                                                        process:
                                                            selectedProcess,
                                                        carrierOrProductName:
                                                            item.name,
                                                        updatedDateStart:
                                                            timerange.from,
                                                        updatedDateEnd:
                                                            timerange.to,
                                                        groupBy:
                                                            CaseCountGroupByEnum.PROCESS_SUB_TYPE,
                                                        status: [
                                                            Statuses.Completed,
                                                        ],
                                                        carrier: filter.carrier,
                                                        brokerDealer:
                                                            filter.brokerDealerName,
                                                    })}
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
                    {!caseTimingDataError &&
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
