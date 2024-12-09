import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HC_TREEMAP from 'highcharts/modules/treemap';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useRef, useState } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { DASHBOARD_DEFAULT_LABEL, DASHBOARD_REPLACE_LABELS } from '@deps/helpers/dashboard/dashboard-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { CaseDashboardStatsResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

const CHART_HEIGHT = 600;

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
    HC_TREEMAP(Highcharts);
}

export type TreeMapInsightsProps = {
    dashboardStatsData?: CaseDashboardStatsResponse;
    heading: string;
    carrierOrBrokerDealer?: GroupByOptions.Carrier | GroupByOptions.BrokerDealerName;
};

export const TreeMapInsights = ({ dashboardStatsData, heading }: TreeMapInsightsProps) => {
    const chartCompomentRef = useRef<HighchartsReact.RefObject>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const shouldShowCaseInsights = useCaseInsightsPermission();
    const [loading, setLoading] = useState(false);

    // TODO: add context for secondary and tertiary groupings if applicable
    const getOpenAiSummary = async (caseStats: DashboardResponseData[]) => {
        try {
            setLoading(true);
            const summary = await getCaseInsights({
                content: JSON.stringify(caseStats),
                prompt: `You are an expert in all things new business application data. Your job is to summarize the data for business and executive users. They want simple and insightful information about the data provided to you. Avoid using phrases such as "the data". Your responses should be insightful and will be displayed on a UI as a summary for a module related to a distribution chart. Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to U.S.`,
            });
            setLoading(false);
            return summary;
        } catch (error) {
            return '';
        }
    };

    // TODO: figure out filtering based on the the secondary and tertiary groupings
    // const seriesData = useMemo(() => {
    //     const data = dashboardStatsData
    //         .find(item => item.name === selectedSubprocess)
    //         ?.values?.filter(item => item.name !== 'NULL_VALUE' && item.name !== '');
    //     return data || []; // always return an array
    // }, [dashboardStatsData]);

    const seriesData = dashboardStatsData?.data; // this will change once filters are added

    const noData = !seriesData || seriesData?.length === 0 || dashboardStatsData?.totalElements === 0;

    // this is the same code that is found in exception-insights.tsx
    const chartOptions: Highcharts.Options = useMemo(() => {
        const chartData: Highcharts.SeriesTreemapOptions['data'] = seriesData?.map((item: DashboardResponseData) => ({
            name: DASHBOARD_REPLACE_LABELS.includes(item.name) ? DASHBOARD_DEFAULT_LABEL : item.name,
            value: item.count,
            colorValue: item.count,
        }));

        return {
            accessibility: {
                enabled: true,
            },
            colorAxis: [
                {
                    min: 0,
                    minColor: '#db004f',
                    maxColor: '#fdf2f6',
                    max: 20,
                },
            ],
            chart: {
                height: CHART_HEIGHT,
                styledMode: false,
            },
            credits: {
                enabled: false,
            },
            navigation: {
                buttonOptions: {
                    enabled: false,
                },
            },
            series: [
                {
                    type: 'treemap',
                    layoutAlgorithm: 'squarified',
                    data: chartData || [],
                    colorAxis: 0,
                    colorKey: 'colorValue',
                    colors: caseChartHelpers.getTreeMapColors(),
                    colorByPoint: true,
                    dataLabels: {
                        align: 'left',
                        verticalAlign: 'top',
                        useHTML: true,
                        formatter: function () {
                            const name = this.point.name;
                            // @ts-expect-error: this actually exists
                            const value = this.point.value;
                            // @ts-expect-error: this actually exists
                            const seriesValues: Array<number> = this.series.valueData;
                            const total = seriesValues.reduce((sum, val) => sum + val, 0);
                            const len = (Number(value) / total) * 100;
                            const ratio = `${value} / ${total}`;
                            const wrapper = document.createElement('div');
                            wrapper.style.backgroundColor = 'var(--color-base-surface-surface-primary)';
                            wrapper.classList.add('rounded', 'typography-content-body');
                            wrapper.style.color = 'var(--color-base-text-text-primary)';
                            wrapper.style.padding = 'var(--measure-dimension-padding-lg)';
                            wrapper.style.margin = 'var(--measure-dimension-margin-sm)';
                            wrapper.style.display = 'flex';
                            wrapper.style.flexDirection = 'column';
                            wrapper.style.justifyContent = 'start';
                            wrapper.style.gap = '4px';
                            wrapper.style.overflow = 'hidden';
                            wrapper.style.textOverflow = 'ellipsis';
                            const nameSpan = document.createElement('span');
                            const valueSpan = document.createElement('span');
                            if (len < Math.max(name.length, ratio.length)) {
                                wrapper.style.margin = 'var(--measure-dimension-margin-2xs)';
                                wrapper.style.padding = '0 var(--measure-dimension-padding-xs)';
                                wrapper.style.justifyContent = 'center';
                                wrapper.style.alignItems = 'center';
                                nameSpan.innerText = len < name.length ? name.substring(0, Math.floor(len)) + '...' : name;
                                valueSpan.innerText = len < ratio.length ? ratio.substring(0, Math.floor(len)) + '...' : ratio;
                                if (len < 1) {
                                    wrapper.style.visibility = 'hidden';
                                }
                            } else {
                                nameSpan.innerText = name;
                                valueSpan.innerText = ratio;
                            }
                            wrapper.appendChild(nameSpan);
                            wrapper.appendChild(valueSpan);
                            return wrapper.outerHTML;
                        },
                    },
                },
            ],
            title: {
                text: '',
            },
            tooltip: {
                useHTML: true,
                formatter: function () {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add(styles.tooltip);
                    wrapper.style.backgroundColor = 'var(--color-base-surface-surface-primary)';
                    wrapper.classList.add('rounded', 'typography-content-body');
                    wrapper.style.color = 'var(--color-base-text-text-primary)';
                    wrapper.style.padding = 'var(--measure-dimension-padding-lg)';
                    wrapper.style.display = 'flex';
                    wrapper.style.flexDirection = 'column';
                    wrapper.style.justifyContent = 'start';
                    wrapper.style.gap = '4px';
                    const nameSpan = document.createElement('span');
                    const valueSpan = document.createElement('span');
                    nameSpan.innerText = this.point.name;
                    // @ts-expect-error: this actually exists
                    valueSpan.innerText = this.point.value;
                    wrapper.appendChild(nameSpan);
                    wrapper.appendChild(valueSpan);
                    return wrapper.outerHTML;
                },
                padding: 0,
            },
        };
    }, [seriesData]);

    useEffect(() => {
        if (!shouldShowCaseInsights) {
            return;
        }
        if (seriesData?.length) {
            getOpenAiSummary(seriesData).then(summary => {
                if (summary) {
                    setAiSummary(summary);
                }
            });
        } else {
            setAiSummary('There are no exceptions.');
        }
    }, [seriesData, shouldShowCaseInsights]);

    return (
        <div className={clsx('bg-white flex flex-col min-h-[600px] lg:flex-row gap-4')}>
            <div className="basis-1/3 flex flex-col gap-4 items-start">
                <div>
                    <Typography variant={TypographyVariant.H3}>{heading}</Typography>
                    <Typography variant={TypographyVariant.Label}>
                        There are {wholeNumberFormatify(dashboardStatsData?.totalElements)} Exceptions
                    </Typography>
                </div>
                {loading ? (
                    <div className="grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                        <PageLoader />
                    </div>
                ) : (
                    <>
                        {!!aiSummary?.length && (
                            <>
                                <div className="flex flow-col items-center align-middle gap-2">
                                    <LightBulbIcon height={'24px'} width={'24px'} />
                                    <Typography variant={TypographyVariant.LabelLg}>Insight</Typography>
                                </div>
                                <Typography variant={TypographyVariant.BodySm}>{aiSummary}</Typography>
                            </>
                        )}
                    </>
                )}
            </div>
            <div className="basis-2/3 flex flex-col">
                <div
                    className={clsx(
                        `w-full h-[${CHART_HEIGHT}px]`,
                        noData && 'grid gap-4 place-content-center bg-[--color-base-surface-surface-tertiary]'
                    )}
                >
                    {noData ? (
                        <div className="flex flex-col gap-2 items-center">
                            <ChartBarsIcon height={'24px'} width={'24px'} />
                            <Typography variant={TypographyVariant.BodyBold}>There are no exceptions</Typography>
                        </div>
                    ) : (
                        <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartCompomentRef} />
                    )}
                </div>
            </div>
        </div>
    );
};
