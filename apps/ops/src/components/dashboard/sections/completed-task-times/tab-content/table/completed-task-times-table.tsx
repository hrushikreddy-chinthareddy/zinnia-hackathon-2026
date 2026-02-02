import {
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Button,
    Icon,
    IconType,
} from '@zinnia/bloom/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { SortableHeaderCell } from '@deps/components/dashboard/components/sortable-header-cell';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { downloadCSV } from '@deps/components/dashboard/download-csv';
import { useCompletedTaskTimes } from '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-context';
import { CompletedTaskTimesFilters } from '@deps/components/dashboard/sections/completed-task-times/tab-content/shared/completed-task-times-filters';
import { CompletedTaskTimesHeader } from '@deps/components/dashboard/sections/completed-task-times/tab-content/shared/completed-task-times-header';
import {
    generateCsvColumns,
    generateTasksCSVFilename,
    getCarrierName,
    flattenCompletedTaskTimeData,
    formatTaskTimeFromArray,
} from '@deps/components/dashboard/sections/completed-task-times/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { useDashboardStore } from '@deps/store/store';
import { formatTaskTime } from '@deps/utils/dates';

import styles from './completed-task-times-table.module.css';

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
    } = useCompletedTaskTimes();

    const { selectedCarriers } = useDashboardStore((state) => state);

    const { t } = useTranslation();

    const carrierName = useMemo(
        () => getCarrierName(selectedCarriers, t),
        [selectedCarriers, t]
    );

    const flattenedData = useMemo(
        () =>
            formatTaskTimeFromArray(
                flattenCompletedTaskTimeData(completedTaskTimeData),
                t
            ),
        [completedTaskTimeData, t]
    );

    const csvFileName = useMemo(
        () => generateTasksCSVFilename(carrierName, timerange, t),
        [carrierName, timerange, t]
    );

    const { handleSort, sortedData, sortOrder } = useTableOptions({
        sortByDefault: SortByOptions.TOTAL_TASKS,
        dataToSort: completedTaskTimeData || [],
    });

    const [activeSortKey, setActiveSortKey] = useState<SortByOptions | null>(
        SortByOptions.TOTAL_TASKS
    );

    const onSort = useCallback(
        (sortKey: SortByOptions) => {
            setActiveSortKey(sortKey);
            handleSort(sortKey as any);
        },
        [handleSort]
    );

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
    const generateExpandableContent = (
        caseType: string,
        tasks: {
            secondMedian: number;
            taskName: string;
            count: number;
        }[]
    ) => {
        return tasks.map((task) => (
            <TableRow key={`${caseType}-${task.taskName}`}>
                <TableCell>
                    <span className="sr-only">{caseType}</span>
                </TableCell>
                <TableCell>{formatTaskTime(task.secondMedian, t)}</TableCell>
                <TableCell className={styles.taskName}>
                    {task.taskName}
                </TableCell>
                <TableCell>{task.count.toLocaleString()}</TableCell>
            </TableRow>
        ));
    };

    const handleExportCSV = useCallback(() => {
        downloadCSV(flattenedData, csvFileName, generateCsvColumns(t));
    }, [flattenedData, csvFileName, t]);

    return (
        <CardContainer>
            <div className={styles.exportContainer}>
                <CompletedTaskTimesHeader />
                <Button
                    mode="link"
                    size="small"
                    className={styles.exportContainerButton}
                    onClick={handleExportCSV}
                >
                    <Icon type={IconType.DOWNLOAD} color="black" />
                    <span>{t('allFields.exportCSV')}</span>
                </Button>
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
                            <colgroup>
                                <col style={{ width: '30%' }} />
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '30%' }} />
                                <col style={{ width: '15%' }} />
                            </colgroup>
                            <caption className="sr-only">
                                {t('allFields.completedTaskTimesTitle')}
                            </caption>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeaderCell
                                        label={t('allFields.caseType')}
                                        sortKey={SortByOptions.CASE_TYPE}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <SortableHeaderCell
                                        label={t(
                                            'allFields.medianProcessingTime'
                                        )}
                                        sortKey={SortByOptions.MEDIAN_TIME}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <TableHeaderCell>
                                        {t('allFields.task')}
                                    </TableHeaderCell>
                                    <SortableHeaderCell
                                        label={t('allFields.totalTasks')}
                                        sortKey={SortByOptions.TOTAL_TASKS}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
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
                                            <TableCell
                                                className={styles.chevronIcon}
                                            >
                                                {toSentenceCase(item.caseType)}
                                            </TableCell>
                                            <TableCell>
                                                {formatTaskTime(
                                                    item.secondMedian,
                                                    t
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {t('allFields.allTasks')}
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
