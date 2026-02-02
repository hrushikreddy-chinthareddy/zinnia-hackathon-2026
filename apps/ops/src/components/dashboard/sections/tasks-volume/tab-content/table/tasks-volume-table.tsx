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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { SortableHeaderCell } from '@deps/components/dashboard/components/sortable-header-cell';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { downloadCSV } from '@deps/components/dashboard/download-csv';
import { useTasksVolume } from '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context';
import { TasksVolumeFilters } from '@deps/components/dashboard/sections/tasks-volume/tab-content/shared/tasks-volume-filters';
import { TasksVolumeHeader } from '@deps/components/dashboard/sections/tasks-volume/tab-content/shared/tasks-volume-header';
import {
    CSV_COLUMNS,
    flattenTaskData,
    generateTasksCSVFilename,
    getCarrierName,
    getStatusDisplayText,
} from '@deps/components/dashboard/sections/tasks-volume/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { useTableOptions } from '@deps/hooks/dashboard/useTableOptions';
import { useDashboardStore } from '@deps/store/store';
import { toSentenceCase } from '@deps/utils/strings';

enum SortByOptions {
    CASE_TYPE = 'caseType',
    TOTAL_TASKS = 'totalTasks',
}

export const TasksVolumeTable = () => {
    const [offset, setOffset] = useState(0);
    const limit = 6; // Show 6 case types per page
    const { t } = useTranslation();

    const {
        taskVolumeData,
        taskVolumeDataFetching,
        taskVolumeDataLoading,
        taskVolumeDataError,
        selectedStatus,
        timerange,
    } = useTasksVolume();

    const { selectedCarriers } = useDashboardStore((state) => state);

    const carrierName = useMemo(
        () => getCarrierName(selectedCarriers, t),
        [selectedCarriers, t]
    );
    const statusText = useMemo(
        () => getStatusDisplayText(selectedStatus, t),
        [selectedStatus, t]
    );

    const flattenedData = useMemo(
        () => flattenTaskData(taskVolumeData),
        [taskVolumeData]
    );

    const csvFileName = useMemo(
        () => generateTasksCSVFilename(carrierName, statusText, timerange),
        [carrierName, statusText, timerange]
    );

    const { handleSort, sortedData, sortOrder } = useTableOptions({
        sortByDefault: SortByOptions.TOTAL_TASKS,
        dataToSort: taskVolumeData || [],
    });

    const [activeSortKey, setActiveSortKey] = useState<SortByOptions | null>(
        SortByOptions.TOTAL_TASKS
    );

    const onSort = useCallback(
        (sortKey: SortByOptions) => {
            setActiveSortKey(sortKey);
            handleSort(sortKey);
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
    const generateExpandableContent = useCallback(
        (caseType: string, tasks: { taskName: string; count: number }[]) => {
            return tasks.map((task) => (
                <TableRow key={`${caseType}-${task.taskName}`}>
                    <TableCell aria-label={caseType}></TableCell>
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

    return (
        <CardContainer>
            <div className="flex justify-between items-center">
                <TasksVolumeHeader />
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
            <TasksVolumeFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader
                    loading={taskVolumeDataFetching || taskVolumeDataLoading}
                >
                    {taskVolumeDataError ? (
                        <ErrorMessage />
                    ) : sortedData?.length === 0 ? (
                        <NoDataMessage />
                    ) : (
                        <Table>
                            <colgroup>
                                <col style={{ width: '45%' }} />
                                <col style={{ width: '35%' }} />
                                <col style={{ width: '20%' }} />
                            </colgroup>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeaderCell
                                        label={t(
                                            'caseStats.tasks.table.headers.caseType'
                                        )}
                                        sortKey={SortByOptions.CASE_TYPE}
                                        activeSortKey={activeSortKey}
                                        onSort={onSort}
                                        sortOrder={sortOrder}
                                    />
                                    <TableHeaderCell>
                                        {t(
                                            'caseStats.tasks.table.headers.task'
                                        )}
                                    </TableHeaderCell>
                                    <SortableHeaderCell
                                        label={t(
                                            'caseStats.tasks.table.headers.totalTasks'
                                        )}
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
                                            <TableCell>
                                                {toSentenceCase(item.caseType)}
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
                    {!taskVolumeDataError && sortedData.length > limit && (
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
