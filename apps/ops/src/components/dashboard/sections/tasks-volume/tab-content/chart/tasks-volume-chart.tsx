import { Icon, IconType, Link, Pagination } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GroupedColumnsChart } from '@deps/components/dashboard/charts/bar-charts/grouped-column-chart/grouped-column-chart';
import { ErrorMessage } from '@deps/components/dashboard/components/errors';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { downloadCSV } from '@deps/components/dashboard/download-csv';
import { useTasksVolume } from '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context';
import { TasksVolumeFilters } from '@deps/components/dashboard/sections/tasks-volume/tab-content/shared/tasks-volume-filters';
import { TasksVolumeHeader } from '@deps/components/dashboard/sections/tasks-volume/tab-content/shared/tasks-volume-header';
import {
    flattenTaskData,
    generateCsvColumns,
    generateTasksCSVFilename,
    getCarrierName,
    getStatusDisplayText,
    TaskVolumeData,
} from '@deps/components/dashboard/sections/tasks-volume/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { useWindowResize } from '@deps/hooks/useWindowResize';
import { useDashboardStore } from '@deps/store/store';
import { adjustShade } from '@deps/utils/colors';
import { toSentenceCase } from '@deps/utils/strings';

const PAGE_LIMIT_DESKTOP = 6;
const PAGE_LIMIT_NARROW = 3;
const CHART_VIEWPORT_BREAKPOINT = 1280;

const buildTaskColorMap = (taskNames: string[]) => {
    const baseColors = caseChartHelpers.getColors();
    const used = new Set<string>();
    const colorMap = new Map<string, string>();

    taskNames.forEach((taskName, index) => {
        const baseColor = baseColors[index % baseColors.length];
        const layer = Math.floor(index / baseColors.length);
        const shadeOffset =
            layer === 0 ? 0 : (layer % 2 === 0 ? 1 : -1) * (12 + layer * 4);

        let color =
            layer === 0 ? baseColor : adjustShade(baseColor, shadeOffset);
        let attempts = 0;
        while (used.has(color) && attempts < 8) {
            color = adjustShade(color, 6);
            attempts += 1;
        }

        used.add(color);
        colorMap.set(taskName, color);
    });

    return colorMap;
};

const toTaskTotals = (data: TaskVolumeData[] | undefined) => {
    const totals = new Map<string, number>();
    data?.forEach((caseType) => {
        caseType.tasks.forEach((task) => {
            totals.set(
                task.taskName,
                (totals.get(task.taskName) ?? 0) + task.count
            );
        });
    });
    return totals;
};

export const TasksVolumeChart = () => {
    const [offset, setOffset] = useState(0);
    const { t } = useTranslation();
    const windowWidth = useWindowResize();

    const isNarrowView = windowWidth <= CHART_VIEWPORT_BREAKPOINT;
    const pageLimit = isNarrowView ? PAGE_LIMIT_NARROW : PAGE_LIMIT_DESKTOP;
    const labelRotation = isNarrowView ? -45 : 0;
    const pointWidth = isNarrowView ? 36 : 48;

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

    const handleExportCSV = useCallback(() => {
        downloadCSV(flattenedData, csvFileName, generateCsvColumns(t));
    }, [flattenedData, csvFileName, t]);

    const normalizedData = useMemo(() => {
        return (
            taskVolumeData
                ?.map((caseType) => ({
                    ...caseType,
                    tasks: caseType.tasks.filter((task) => task.count > 0),
                }))
                .filter(
                    (caseType) =>
                        caseType.totalTasks > 0 && caseType.tasks.length > 0
                ) ?? []
        );
    }, [taskVolumeData]);

    const sortedData = useMemo(() => {
        return [...normalizedData].sort((a, b) => b.totalTasks - a.totalTasks);
    }, [normalizedData]);

    const safeOffset = useMemo(
        () =>
            Math.max(
                0,
                Math.min(offset, Math.max(0, sortedData.length - pageLimit))
            ),
        [offset, sortedData.length, pageLimit]
    );

    const paginatedData = useMemo(() => {
        return sortedData.slice(safeOffset, safeOffset + pageLimit);
    }, [safeOffset, sortedData, pageLimit]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * pageLimit);
        },
        [pageLimit]
    );

    const prevSortedDataRef = useRef(sortedData);
    useEffect(() => {
        const dataChanged = prevSortedDataRef.current !== sortedData;
        prevSortedDataRef.current = sortedData;
        const maxOffset = Math.max(0, sortedData.length - pageLimit);
        setOffset((prev) => {
            if (dataChanged || prev >= sortedData.length) return 0;
            return Math.min(prev, maxOffset);
        });
    }, [pageLimit, sortedData]);

    const taskTotals = useMemo(
        () => toTaskTotals(normalizedData),
        [normalizedData]
    );
    const orderedTaskNames = useMemo(() => {
        const entries: [string, number][] = [];
        taskTotals.forEach((value, key) => {
            entries.push([key, value]);
        });
        entries.sort((a, b) => b[1] - a[1]);
        return entries.map(([name]) => name);
    }, [taskTotals]);

    const colorMap = useMemo(
        () => buildTaskColorMap(orderedTaskNames),
        [orderedTaskNames]
    );

    const categories = useMemo(
        () => paginatedData.map((item) => toSentenceCase(item.caseType)),
        [paginatedData]
    );

    const series = useMemo(() => {
        const taskIndex = new Map<string, number>();
        orderedTaskNames.forEach((name, index) => taskIndex.set(name, index));

        const taskData: number[][] = orderedTaskNames.map(() =>
            new Array(paginatedData.length).fill(0)
        );

        paginatedData.forEach((caseType, caseIndex) => {
            caseType.tasks.forEach((task) => {
                const index = taskIndex.get(task.taskName);
                if (index !== undefined) {
                    taskData[index][caseIndex] = task.count;
                }
            });
        });

        return orderedTaskNames.map((taskName, index) => ({
            name: taskName,
            data: taskData[index],
            color: colorMap.get(taskName),
            stack: 'tasks',
        }));
    }, [orderedTaskNames, paginatedData, colorMap]);

    const hasChartData = series.length > 0 && categories.length > 0;
    const showChart = !taskVolumeDataError && hasChartData;

    const showStateMessage = taskVolumeDataError || !hasChartData;
    const stateMessage = useMemo(() => {
        if (taskVolumeDataError) return t('allFields.taskVolumeError');
        const allText = String(t('allFields.all'));
        return statusText === allText
            ? t('allFields.taskVolumeEmptyStateAll')
            : t('allFields.taskVolumeEmptyStateStatus', { status: statusText });
    }, [taskVolumeDataError, statusText, t]);

    return (
        <CardContainer>
            <div className={sharedStyles.headerRow}>
                <TasksVolumeHeader />
                <div
                    className={sharedStyles.exportLink}
                    onClick={handleExportCSV}
                >
                    <Icon type={IconType.DOWNLOAD} />
                    <Link href={'#'} text={t('allFields.exportCSV')} />
                </div>
            </div>
            <TasksVolumeFilters />
            <div
                className={clsx(
                    sharedStyles.chartContainer,
                    sharedStyles.tableContainer
                )}
            >
                <BlurOverlayLoader
                    loading={taskVolumeDataFetching || taskVolumeDataLoading}
                >
                    {showStateMessage ? (
                        <ErrorMessage
                            className={sharedStyles.emptyStateContainer}
                            message={stateMessage}
                        />
                    ) : (
                        <GroupedColumnsChart
                            categories={categories}
                            series={series}
                            xAxisTitle={String(
                                t('allFields.taskVolumeChartXAxisTitle') ?? ''
                            )}
                            yAxisTitle={String(
                                t('allFields.taskVolumeChartYAxisTitle') ?? ''
                            )}
                            height={420}
                            pointWidth={pointWidth}
                            groupPadding={0.2}
                            stacking="normal"
                            labelRotation={labelRotation}
                            spacingBottom={labelRotation !== 0 ? 80 : undefined}
                        />
                    )}
                    {showChart && sortedData.length > pageLimit && (
                        <div className={sharedStyles.paginationContainer}>
                            <Pagination
                                limit={pageLimit}
                                offset={safeOffset}
                                total={sortedData.length}
                                goToPage={goToPage}
                            />
                        </div>
                    )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
