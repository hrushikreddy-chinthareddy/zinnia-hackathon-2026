import { Link } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HC_TREEMAP from 'highcharts/modules/treemap';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useRef, useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TimeframeFilterOptions } from '@deps/containers/dashboard/issued-business/issued-business';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { DASHBOARD_DEFAULT_LABEL, DASHBOARD_REPLACE_LABELS, dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { GroupByOptions } from '@deps/models/case/enums';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

import PageLoader from '../page-loader/page-loader';

const CHART_HEIGHT = 500;

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
    HC_TREEMAP(Highcharts);
}

export type ExceptionInsightsProps = {
    completedCasesByProcessSubType?: DashboardResponseData[];
    selectedSubprocess: string;
    selectedException: string | undefined;
    timeframe: TimeframeFilterOptions;
    carrierOrBrokerDealer?: GroupByOptions.Carrier | GroupByOptions.BrokerDealerName;
};

export const ExceptionInsights = ({
    completedCasesByProcessSubType,
    selectedException = '',
    selectedSubprocess = '',
    timeframe,
}: ExceptionInsightsProps) => {
    const chartCompomentRef = useRef<HighchartsReact.RefObject>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const shouldShowCaseInsights = useCaseInsightsPermission();
    const [loading, setLoading] = useState(false);

    const getOpenAiSummary = async (caseStats: DashboardResponseData[], processSubType: string) => {
        try {
            setLoading(true);
            const summary = await getCaseInsights({
                content: JSON.stringify(caseStats),
                prompt: `You are an expert in all things new business application data. Your job is to summarize the data for business and executive users. They want simple and insightful information about the data provided to you. The data provided to you here are completed ${dashboardChartTitleFormat(
                    processSubType,
                    false
                )} applications, but the ${dashboardChartTitleFormat(
                    processSubType,
                    false
                )} applications encountered NIGOs along their path to completion. The data is grouped by NIGO Category and the values represent a NIGO that occurred for a ${dashboardChartTitleFormat(
                    processSubType,
                    false
                )} application. Avoid using phrases such as "the data". Your responses should be insightful and will be displayed on a UI as a summary for a module related to a distribution chart. Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to United States, including commas where appropriate. Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
            });
            setLoading(false);
            return summary;
        } catch (error) {
            return '';
        }
    };
    const exceptions = useMemo(() => {
        return completedCasesByProcessSubType
            ? completedCasesByProcessSubType
                  .find(item => item.name === selectedSubprocess)
                  ?.values?.filter(item => item.name !== 'NULL_VALUE' && item.name !== '')
            : null;
    }, [completedCasesByProcessSubType, selectedSubprocess]);
    const noData = !exceptions || exceptions?.length === 0;
    const chartOptions: Highcharts.Options = useMemo(() => {
        // todo: XG - add ref for keeping track of all exception types so we can animate smoothly
        let seriesData: DashboardResponseData[] = [];
        if (!exceptions || exceptions?.length === 0) {
            seriesData = [];
        } else {
            seriesData = exceptions;
        }

        const chartData: Highcharts.SeriesTreemapOptions['data'] = seriesData.map((item: DashboardResponseData) => ({
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
                spacingTop: 0,
                spacingLeft: 0,
                spacingRight: 0,
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
                    data: chartData,
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
                            const wrapper = document.createElement('div');
                            // @ts-expect-error: this actually exists
                            const dataLabel = this.point.dataLabel;
                            const shape = this.point.shapeArgs;
                            wrapper.style.backgroundColor = 'var(--color-base-surface-surface-primary)';
                            wrapper.classList.add('rounded', 'typography-content-body');
                            wrapper.style.color = 'var(--color-base-text-text-primary)';
                            wrapper.style.margin = 'var(--measure-dimension-margin-sm)';
                            wrapper.style.fontFamily = 'var(--font-family-secondary)';
                            wrapper.style.fontSize = '11px';
                            wrapper.style.overflow = 'hidden';
                            wrapper.style.textOverflow = 'ellipsis';

                            wrapper.style.margin = 'var(--measure-dimension-margin-2xs)';
                            wrapper.style.padding = 'var(--measure-dimension-padding-xs)';
                            wrapper.style.alignItems = 'center';

                            const nameSpan = document.createElement('span');
                            // const valueSpan = document.createElement('span');
                            nameSpan.innerText = name;

                            //TODO: For some reason, dataLabel can be undefined sometimes and cause issues
                            if (dataLabel?.width + dataLabel?.padding >= shape?.width) {
                                wrapper.style.whiteSpace = 'break-spaces';

                                if (len < 1) {
                                    wrapper.style.visibility = 'hidden';
                                }
                            }

                            if (dataLabel?.height + dataLabel?.padding >= shape?.height) {
                                wrapper.style.visibility = 'hidden';
                            }
                            wrapper.appendChild(nameSpan);
                            // wrapper.appendChild(valueSpan);
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
                    wrapper.style.fontSize = '11px';
                    const nameSpan = document.createElement('span');
                    const valueSpan = document.createElement('span');

                    // @ts-expect-error: this actually exists
                    const value = this.point.value;
                    // @ts-expect-error: this actually exists
                    const seriesValues: Array<number> = this.series.valueData;
                    const total = seriesValues.reduce((sum, val) => sum + val, 0);
                    const ratio = `${value} / ${total}`;

                    nameSpan.innerText = this.point.name;
                    valueSpan.innerText = ratio;
                    wrapper.appendChild(nameSpan);
                    wrapper.appendChild(valueSpan);
                    return wrapper.outerHTML;
                },
                padding: 0,
            },
        };
    }, [exceptions]);

    const caseLink = useMemo(() => {
        const href = new URL('/cases', window.location.origin);
        if (selectedSubprocess.length > 0) {
            href.searchParams.append('processSubType', selectedSubprocess);
        }
        if (selectedException.length > 0) {
            href.searchParams.append('case', selectedException);
        }
        return href.toString();
    }, [selectedSubprocess, selectedException]);

    useEffect(() => {
        if (!shouldShowCaseInsights) {
            return;
        }
        if (exceptions?.length) {
            getOpenAiSummary(exceptions, selectedSubprocess).then(summary => {
                if (summary) {
                    setAiSummary(summary);
                }
            });
        } else {
            setAiSummary(`No NIGOs for ${dashboardChartTitleFormat(selectedSubprocess)} in the ${timeframe}.`);
        }
    }, [exceptions, selectedSubprocess, shouldShowCaseInsights, timeframe]);

    return (
        <div className={clsx('bg-white flex flex-col lg:flex-row gap-4')}>
            <div className="basis-1/4 flex flex-col gap-4 items-start">
                <div>
                    <Typography variant={TypographyVariant.H3}>{dashboardChartTitleFormat(selectedSubprocess, false)}</Typography>
                    <Typography variant={TypographyVariant.Label}>NIGO Distribution</Typography>
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
                        <Link
                            size="small"
                            className="mt-4 inline"
                            href={caseLink}
                            text={`View all ${dashboardChartTitleFormat(selectedSubprocess)} NIGOs`}
                        />
                    </>
                )}
            </div>
            <div className="basis-3/4 flex flex-col">
                <Typography className="ml-2" variant={TypographyVariant.LabelMd}>
                    {toTitleCase(timeframe)}
                </Typography>
                <div
                    className={clsx(
                        `w-full h-[${CHART_HEIGHT}px]`,
                        noData && 'grid gap-4 place-content-center bg-[--color-base-surface-surface-tertiary]'
                    )}
                >
                    {noData ? (
                        <div className="flex flex-col gap-2 items-center">
                            <ChartBarsIcon height={'24px'} width={'24px'} />
                            <Typography variant={TypographyVariant.BodyBold}>
                                No NIGOs for {dashboardChartTitleFormat(selectedSubprocess)} in the {timeframe}
                            </Typography>
                        </div>
                    ) : (
                        <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartCompomentRef} />
                    )}
                </div>
            </div>
        </div>
    );
};
