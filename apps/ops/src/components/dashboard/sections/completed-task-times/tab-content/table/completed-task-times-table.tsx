import {
    Icon,
    IconType,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Button,
} from '@zinnia/bloom/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
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

const ICON_COLOR = 'var(--color-secondary-color-secondary)';

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
                                    <TableHeaderCell
                                        onClick={() =>
                                            handleSort(SortByOptions.CASE_TYPE)
                                        }
                                        sortable
                                    >
                                        {t('allFields.caseType')}
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color={ICON_COLOR}
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
                                        {t('allFields.medianProcessingTime')}
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color={ICON_COLOR}
                                            height={16}
                                            width={16}
                                        />
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {t('allFields.task')}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        onClick={() =>
                                            handleSort(
                                                SortByOptions.TOTAL_TASKS
                                            )
                                        }
                                        sortable
                                    >
                                        {t('allFields.totalTasks')}
                                        <Icon
                                            className={sharedStyles.sortIcon}
                                            type={IconType.SORT}
                                            color={ICON_COLOR}
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
