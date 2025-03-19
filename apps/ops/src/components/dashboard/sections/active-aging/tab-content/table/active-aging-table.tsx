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
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import { friendlyGroupByName } from '../../../submission-type/utils';
import { ActiveAgingContext } from '../../context/active-aging-context';
import { calculateEndDate, startDates } from '../../utils';
import { ActiveAgingFilters } from '../shared/active-aging-filters';
import { ActiveAgingHeader } from '../shared/active-aging-header';

enum SortByOptions {
    NAME = 'name',
    TOTAL = 'total',
}

const generateCaseLink = (
    process: Processes | ExtendedProcesses | undefined, // case type
    name: string, // request sub type
    createdStartDate: string,
    createdEndDate: string,
    groupBy: GroupByOptions,
    caseStatus: Statuses[] = []
) => {
    const carrierOrProduct =
        groupBy === GroupByOptions.ProcessSubType ? 'requestSubType' : groupBy === GroupByOptions.Carrier ? 'carrier' : 'brokerDealerName';

    return `/cases?process=${
        process === 'all' ? '' : process
    }&${carrierOrProduct}=${name}&createdDateStart=${createdStartDate}&createdDateEnd=${createdEndDate}&caseStatus=${caseStatus.join(
        '&caseStatus='
    )}`;
};

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
        return dataByTimeframe.filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
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

    //Send users back to page 1 if data for page doesnt exist after filters update
    useEffect(() => {
        if (offset > sortedData.length) {
            goToPage(1);
        }
    }, [sortedData, goToPage, offset]);

    const generateExpandableContent = useCallback(
        (name: string, countByDay: { [key: string]: number }) => {
            return Object.keys(countByDay)
                .reverse()
                .map(key => {
                    const startDate = dayjs(key);
                    const daysActive = dayjs().diff(startDate, 'day');
                    return (
                        <TableRow key={key}>
                            <TableCell>{name}</TableCell>
                            <TableCell>{countByDay[key]}</TableCell>
                            <TableCell>{daysActive} Days</TableCell>
                            <TableCell>
                                <NavElement
                                    type={NavElementType.Link}
                                    target="_blank"
                                    href={generateCaseLink(selectedProcess, name, key, key, groupBy, filter.caseStatus)}
                                    rel="noreferrer"
                                >
                                    View cases
                                </NavElement>
                            </TableCell>
                        </TableRow>
                    );
                });
        },
        [filter.caseStatus, groupBy, selectedProcess]
    );

    return (
        <CardContainer>
            <ActiveAgingHeader />
            <div className={sharedStyles.searchContainer}>
                <FieldDataActive
                    fieldSize="small"
                    placeholder={`Search by ${friendlyGroupByName[groupBy]?.toLocaleLowerCase()} name`}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>
            <ActiveAgingFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader loading={activeAgingDataFetching || activeAgingDataLoading}>
                    {activeAgingDataError ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {'Something went wrong fetching insights, please try again by refreshing the page'}
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
                                        {friendlyGroupByName[groupBy]}
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell onClick={() => handleSort(SortByOptions.TOTAL)} sortable>
                                        Total submissions
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell>Days active</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map(item => {
                                    const startDate = startDates[timeframe];
                                    const endDate = calculateEndDate(timeframe);

                                    return (
                                        <TableRow
                                            key={`${item.name}-${item.count}`}
                                            isExpandable
                                            showChevron
                                            expandedContent={generateExpandableContent(item.name, item.countByDay)}
                                        >
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.total}</TableCell>
                                            <TableCell>{timeframe}</TableCell>
                                            <TableCell>
                                                <NavElement
                                                    type={NavElementType.Link}
                                                    target="_blank"
                                                    href={generateCaseLink(
                                                        selectedProcess,
                                                        item.name,
                                                        startDate,
                                                        endDate,
                                                        groupBy,
                                                        filter.caseStatus
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
                    {!activeAgingDataError && searchedData?.length > 0 && (
                        <div className={sharedStyles.paginationContainer}>
                            <Pagination limit={limit} offset={offset} total={searchedData?.length || 0} goToPage={goToPage} />
                        </div>
                    )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
