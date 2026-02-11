import { Pagination } from '@zinnia/bloom/components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AXIS_LABEL_STYLE,
    AXIS_TITLE_STYLE,
} from '@deps/components/dashboard/charts/bar-charts/grouped-column-chart/grouped-column-chart.styles';
import { ErrorMessage } from '@deps/components/dashboard/components/errors';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { Legend } from '@deps/components/dashboard/legend/legend';
import { useCompletedTaskTimes } from '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-context';
import { CompletedTaskTimesFilters } from '@deps/components/dashboard/sections/completed-task-times/tab-content/shared/completed-task-times-filters';
import { CompletedTaskTimesHeader } from '@deps/components/dashboard/sections/completed-task-times/tab-content/shared/completed-task-times-header';
import { generateCompletedTaskTimesSeries } from '@deps/components/dashboard/sections/completed-task-times/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { adjustShade } from '@deps/utils/colors';

import styles from './completed-task-times-chart.module.css';
const TASKS_PER_PAGE = 6;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const SECONDS_IN_MONTH = 30 * SECONDS_IN_DAY;

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

const formatDuration = (seconds: number, t: (key: string) => string) => {
    if (seconds < SECONDS_IN_HOUR) {
        return `${(seconds / 60).toFixed(1)} ${t('allFields.minutesLabel')}`;
    }

    const hours = seconds / SECONDS_IN_HOUR;
    if (hours < 24) {
        return `${hours.toFixed(1)} ${t('allFields.hoursLabel')}`;
    }

    if (seconds < SECONDS_IN_MONTH) {
        return `${(seconds / SECONDS_IN_DAY).toFixed(1)} ${t(
            'allFields.daysLabel'
        )}`;
    }

    return `${(seconds / SECONDS_IN_MONTH).toFixed(1)} ${t(
        'allFields.monthsLabel'
    )}`;
};

const tooltipLabel = (
    color: string,
    title: string,
    medianValue: string,
    medianLabel: string,
    countValue: string,
    countLabel: string
) => {
    const safeTitle = String(title);
    const safeMedianValue = String(medianValue);
    const safeMedianLabel = String(medianLabel);
    const safeCountValue = String(countValue);
    const safeCountLabel = String(countLabel);
    return `
        <div>
            <div class="${styles.tooltipContainer}">
                <span class="${styles.tooltipSwatch}" style="background:${color};"></span>
                <div class="${styles.tooltipText}">
                    <span><b>&nbsp;${safeTitle}</b></span>
                    <span>${safeCountLabel}: ${safeCountValue}</span>
                    <span>${safeMedianLabel}: ${safeMedianValue}</span>
                </div>
            </div>
        </div>
    `;
};

const getTickInterval = (maxDays: number) => {
    if (maxDays <= 12) return 3;
    if (maxDays <= 20) return 5;
    if (maxDays <= 40) return 10;
    if (maxDays <= 80) return 20;
    return 30;
};

export const CompletedTaskTimesChart = () => {
    const [taskOffset, setTaskOffset] = useState(0);
    const { t } = useTranslation();

    const {
        completedTaskTimeData,
        completedTaskTimeDataFetching,
        completedTaskTimeDataLoading,
        completedTaskTimeDataError,
    } = useCompletedTaskTimes();

    const normalizedData = useMemo(() => {
        return (
            completedTaskTimeData
                ?.map((caseType) => ({
                    ...caseType,
                    tasks: caseType.tasks.filter(
                        (task) => task.count > 0 && task.secondMedian > 0
                    ),
                }))
                .filter(
                    (caseType) =>
                        caseType.totalTasks > 0 && caseType.tasks.length > 0
                ) ?? []
        );
    }, [completedTaskTimeData]);

    const sortedCaseTypes = useMemo(() => {
        return [...normalizedData].sort(
            (a, b) => b.secondMedian - a.secondMedian
        );
    }, [normalizedData]);

    const taskTotals = useMemo(() => {
        const totals = new Map<string, number>();
        sortedCaseTypes.forEach((caseType) => {
            caseType.tasks.forEach((task) => {
                totals.set(
                    task.taskName,
                    (totals.get(task.taskName) ?? 0) + task.secondMedian
                );
            });
        });
        return totals;
    }, [sortedCaseTypes]);

    const orderedTaskNames = useMemo(() => {
        const entries: [string, number][] = [];
        taskTotals.forEach((value, key) => {
            entries.push([key, value]);
        });
        entries.sort((a, b) => b[1] - a[1]);
        return entries.map(([name]) => name);
    }, [taskTotals]);

    const pagedTaskNames = useMemo(() => {
        return orderedTaskNames.slice(taskOffset, taskOffset + TASKS_PER_PAGE);
    }, [orderedTaskNames, taskOffset]);

    const stackedTaskNames = useMemo(() => {
        return [...pagedTaskNames].sort((a, b) => {
            return (taskTotals.get(a) ?? 0) - (taskTotals.get(b) ?? 0);
        });
    }, [pagedTaskNames, taskTotals]);

    useEffect(() => {
        setTaskOffset(0);
    }, [orderedTaskNames]);

    const colorMap = useMemo(
        () => buildTaskColorMap(orderedTaskNames),
        [orderedTaskNames]
    );

    const categories = useMemo(
        () => sortedCaseTypes.map((item) => toSentenceCase(item.caseType)),
        [sortedCaseTypes]
    );

    const series = useMemo<Highcharts.SeriesOptionsType[]>(() => {
        return generateCompletedTaskTimesSeries(
            stackedTaskNames,
            sortedCaseTypes,
            colorMap,
            SECONDS_IN_DAY
        );
    }, [stackedTaskNames, sortedCaseTypes, colorMap]);

    const maxDays = useMemo(() => {
        if (series.length === 0) return 0;
        return sortedCaseTypes.reduce((max, _caseType, caseIndex) => {
            const total = series.reduce((sum, seriesItem) => {
                const barSeries = seriesItem as Highcharts.SeriesBarOptions;
                const point = barSeries.data?.[caseIndex] as
                    | { y: number }
                    | undefined;
                return sum + (point?.y ?? 0);
            }, 0);
            return Math.max(max, total);
        }, 0);
    }, [series, sortedCaseTypes]);

    const tickInterval = getTickInterval(maxDays);
    const tickMax = Math.ceil(maxDays / tickInterval) * tickInterval;
    const tickPositions = Array.from(
        { length: tickMax / tickInterval + 1 },
        (_, index) => index * tickInterval
    );

    const legendItems = useMemo(
        () =>
            stackedTaskNames.map((taskName) => ({
                label: taskName,
                color: colorMap.get(taskName) ?? 'var(--color-base-text-link)',
            })),
        [stackedTaskNames, colorMap]
    );

    const chartOptions = useMemo(
        () =>
            Highcharts.merge(caseChartHelpers.getBaseBarChartConfiguration(), {
                chart: {
                    type: 'bar',
                    height: 420,
                },
                xAxis: {
                    categories,
                    title: {
                        text: t('allFields.completedTaskTimesYAxisLabel'),
                        style: AXIS_TITLE_STYLE,
                    },
                    labels: {
                        useHTML: false,
                        style: AXIS_LABEL_STYLE,
                    },
                },
                yAxis: {
                    max: tickMax || undefined,
                    tickPositions:
                        tickPositions.length > 1 ? tickPositions : undefined,
                    title: {
                        text: t('allFields.completedTaskTimesXAxisLabel'),
                        style: AXIS_TITLE_STYLE,
                    },
                    labels: {
                        formatter: function (
                            this: Highcharts.AxisLabelsFormatterContextObject
                        ) {
                            return `${this.value} ${t('allFields.daysLabel')}`;
                        },
                        style: AXIS_LABEL_STYLE,
                    },
                },
                legend: {
                    enabled: false,
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        animation: { duration: 500 },
                    },
                    bar: {
                        pointWidth: 18,
                        groupPadding: 0.12,
                    },
                },
                tooltip: {
                    useHTML: true,
                    outside: true,
                    formatter: function (
                        this: Highcharts.TooltipFormatterContextObject
                    ) {
                        const point = this.point as unknown as {
                            custom?: { seconds?: number; count?: number };
                        };
                        const seconds = point.custom?.seconds ?? 0;
                        const count = point.custom?.count ?? 0;
                        const taskName = this.series?.name ?? '';
                        const timeLabel = formatDuration(seconds, t);
                        const medianLabel = t('allFields.medianProcessingTime');
                        const countLabel = t('allFields.totalTasks');

                        return tooltipLabel(
                            String(
                                this.series?.color ??
                                    'var(--color-base-text-link)'
                            ),
                            taskName,
                            timeLabel,
                            medianLabel,
                            count.toLocaleString(),
                            countLabel
                        );
                    },
                },
                series,
            }),
        [categories, series, tickMax, tickPositions, t]
    );

    const hasData = series.length > 0 && sortedCaseTypes.length > 0;
    const shouldShowStateMessage = completedTaskTimeDataError || !hasData;
    const stateMessage = completedTaskTimeDataError
        ? (t('allFields.completedTaskTimesErrorState') as string)
        : (t('allFields.completedTaskTimesEmptyState') as string);

    return (
        <CardContainer>
            <CompletedTaskTimesHeader />
            <CompletedTaskTimesFilters />
            <div className={sharedStyles.tableContainer}>
                <BlurOverlayLoader
                    loading={
                        completedTaskTimeDataLoading ||
                        completedTaskTimeDataFetching
                    }
                >
                    {shouldShowStateMessage ? (
                        <ErrorMessage
                            className={sharedStyles.emptyStateContainer}
                            message={stateMessage}
                        />
                    ) : (
                        <>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={chartOptions}
                            />
                            <Legend
                                title={t(
                                    'allFields.completedTaskTimesLegendTitle'
                                )}
                                items={legendItems}
                                containerClass={sharedStyles.chartLegend}
                            />
                            {orderedTaskNames.length > TASKS_PER_PAGE && (
                                <div
                                    className={sharedStyles.paginationContainer}
                                >
                                    <Pagination
                                        limit={TASKS_PER_PAGE}
                                        offset={taskOffset}
                                        total={orderedTaskNames.length}
                                        goToPage={(pageNumber) =>
                                            setTaskOffset(
                                                (pageNumber - 1) *
                                                    TASKS_PER_PAGE
                                            )
                                        }
                                    />
                                </div>
                            )}
                        </>
                    )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
