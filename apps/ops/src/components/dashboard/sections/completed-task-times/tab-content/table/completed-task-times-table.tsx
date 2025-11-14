import { toSentenceCase } from '@xd/utils/dist';
import {
    Icon,
    IconType,
    Link,
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
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { downloadCSV } from '@deps/components/dashboard/download-csv';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { useDashboardStore } from '@deps/store/store';

import { CompletedTaskTimeContext } from '../../context/completed-task-times-context';
import {
    CSV_COLUMNS,
    generateTasksCSVFilename,
    getCarrierName,
    flattenCompletedTaskTimeData,
    formatTaskTime,
} from '../../utils';
import { CompletedTaskTimesFilters } from '../shared/completed-task-times-filters';
import { CompletedTaskTimesHeader } from '../shared/completed-task-times-header';

enum SortByOptions {
    CASE_TYPE = 'caseType',
    TOTAL_TASKS = 'totalTasks',
    MEDIAN_TIME = 'secondMedian',
    MAX_TIME = 'secondHigh',
    MIN_TIME = 'secondLow',
}

export const CompletedTaskTimesTable = () => {
    const [offset, setOffset] = useState(0);
    const limit = 6; // Show 6 case types per page

    const {
        completedTaskTimeData,
        completedTaskTimeDataFetching,
        completedTaskTimeDataLoading,
        completedTaskTimeDataError,
        timerange,
    } = useContext(CompletedTaskTimeContext);

    const { selectedCarriers } = useDashboardStore((state) => state);

    const carrierName = useMemo(
        () => getCarrierName(selectedCarriers),
        [selectedCarriers]
    );

    const flattenedData = useMemo(
        () => flattenCompletedTaskTimeData(completedTaskTimeData),
        [completedTaskTimeData]
    );

    const csvFileName = useMemo(
        () => generateTasksCSVFilename(carrierName, timerange),
        [carrierName, timerange]
    );

    const { handleSort, sortedData } = useTableOptions({
        sortByDefault: SortByOptions.TOTAL_TASKS,
        dataToSort: completedTaskTimeData || [],
    });

    const paginatedData = useMemo(() => {
        return sortedData.slice(offset, offset + limit);
    }, [offset, limit, sortedData]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit]
    );

    // If sorted data updates, go back to page 1
    useEffect(() => {
        goToPage(1);
    }, [goToPage, sortedData]);

    // Generate expandable content for each case type showing individual tasks
    const generateExpandableContent = useCallback(
        (
            caseType: string,
            tasks: {
                secondMedian: number;
                secondHigh: number;
                secondLow: number;
                taskName: string;
                count: number;
            }[]
        ) => {
            return tasks.map((task) => (
                <TableRow key={`${caseType}-${task.taskName}`}>
                    <TableCell aria-label={caseType}></TableCell>
                    <TableCell>{formatTaskTime(task.secondMedian)}</TableCell>
                    <TableCell>{formatTaskTime(task.secondHigh)}</TableCell>
                    <TableCell>{formatTaskTime(task.secondLow)}</TableCell>
                    <TableCell>{task.taskName}</TableCell>
                    <TableCell>{task.count.toLocaleString()}</TableCell>
                </TableRow>
            ));
        },
        []
    );

    const handleExportCSV = useCallback(() => {
        downloadCSV(flattenedData, csvFileName, CSV_COLUMNS);
    }, [flattenedData, csvFileName]);
    const { t } = useTranslation();

    return (
        <CardContainer>
            <div className="flex justify-between items-center">
                <CompletedTaskTimesHeader />
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleExportCSV}
                >
                    <Icon type={IconType.DOWNLOAD} />
                    <Link
                        href={'#'}
                        text={t('caseStats.tasks.table.exportCSV')}
                    />
                </div>
            </div>
            <CompletedTaskTimesFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader
                    loading={
                        completedTaskTimeDataFetching ||
                        completedTaskTimeDataLoading
                    }
                >
                    {completedTaskTimeDataError ? (
                        <ErrorMessage />
                    ) : sortedData?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell
                                        onClick={() =>
                                            handleSort(SortByOptions.CASE_TYPE)
                                        }
                                        sortable
                                    >
                                        {t(
                                            'caseStats.completedTaskTimes.table.headers.caseType'
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
                                            handleSort(
                                                SortByOptions.MEDIAN_TIME
                                            )
                                        }
                                        sortable
                                    >
                                        {t(
                                            'caseStats.completedTaskTimes.table.headers.medianTime'
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
                                            handleSort(SortByOptions.MAX_TIME)
                                        }
                                        sortable
                                    >
                                        {t(
                                            'caseStats.completedTaskTimes.table.headers.maxTime'
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
                                            handleSort(SortByOptions.MIN_TIME)
                                        }
                                        sortable
                                    >
                                        {t(
                                            'caseStats.completedTaskTimes.table.headers.minTime'
                                        )}
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {t(
                                            'caseStats.completedTaskTimes.table.headers.task'
                                        )}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        onClick={() =>
                                            handleSort(
                                                SortByOptions.TOTAL_TASKS
                                            )
                                        }
                                        sortable
                                    >
                                        {t(
                                            'caseStats.completedTaskTimes.table.headers.totalTasks'
                                        )}
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color="#00628B"
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => {
                                    return (
                                        <TableRow
                                            key={`${item.caseType}-${item.totalTasks}`}
                                            isExpandable
                                            showChevron
                                            expandedContent={generateExpandableContent(
                                                item.caseType,
                                                item.tasks
                                            )}
                                        >
                                            <TableCell>
                                                {toSentenceCase(item.caseType)}
                                            </TableCell>
                                            <TableCell>
                                                {formatTaskTime(
                                                    item.secondMedian
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatTaskTime(
                                                    item.secondHigh
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatTaskTime(item.secondLow)}
                                            </TableCell>
                                            <TableCell>
                                                {t(
                                                    'caseStats.tasks.table.allTasks'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.totalTasks.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                    {!completedTaskTimeDataError &&
                        sortedData.length > limit && (
                            <div className={sharedStyles.paginationContainer}>
                                <Pagination
                                    limit={limit}
                                    offset={offset}
                                    total={sortedData?.length || 0}
                                    goToPage={goToPage}
                                />
                            </div>
                        )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
