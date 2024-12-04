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
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { DASHBOARD_DEFAULT_LABEL, DASHBOARD_REPLACE_LABELS, dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

import PageLoader from '../page-loader/page-loader';

const CHART_HEIGHT = 600;

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
    HC_TREEMAP(Highcharts);
}

export type ExceptionInsightsProps = {
    completedCasesByProcessSubType: DashboardResponseData[];
    selectedSubprocess: string;
    selectedException: string | undefined;
    timeframe: string;
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
                )} applications encountered exceptions along their path to completion. The data is grouped by Exception Category and the values represent an exception that occurred for a ${dashboardChartTitleFormat(
                    processSubType,
                    false
                )} application. Avoid using phrases such as "the data". Your responses should be insightful and will be displayed on a UI as a summary for a module related to a distribution chart. Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to U.S.`,
            });
            setLoading(false);
            return summary;
        } catch (error) {
            return '';
        }
    };
    const exceptions = useMemo(() => {
        return completedCasesByProcessSubType
            .find(item => item.name === selectedSubprocess)
            ?.values?.filter(item => item.name !== 'NULL_VALUE');
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
            },
            credits: {
                enabled: false,
            },
            navigation: {
                buttonOptions: {
                    enabled: false,
                },
            },
            // plotOptions: {
            // series: {
            // allowPointSelect: true,
            // point: {
            //     events: {
            //         select: function (e: Highcharts.PointInteractionEventObject) {
            //             const selection = e.target as unknown as Highcharts.Point;
            //             setSelectedException(selection?.name);
            //         },
            //     },
            // },
            // },
            // },
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
                        useHTML: true,
                        formatter: function () {
                            const name = this.point.name;
                            // @ts-expect-error: this actually exists
                            const value = this.point.value;
                            // @ts-expect-error: this actually exists
                            const seriesValues: Array<number> = this.series.valueData;
                            const total = seriesValues.reduce((sum, val) => sum + val, 0);
                            const wrapper = document.createElement('div');
                            wrapper.style.color = 'white';
                            wrapper.style.textShadow = '2px 2px black';
                            wrapper.style.display = 'flex';
                            wrapper.style.flexDirection = 'column';
                            wrapper.style.alignItems = 'center';
                            wrapper.style.justifyContent = 'center';
                            wrapper.style.textAlign = 'center';
                            wrapper.style.gap = '4px';
                            const nameSpan = document.createElement('span');
                            nameSpan.innerText = name;
                            wrapper.appendChild(nameSpan);
                            const valueSpan = document.createElement('span');
                            valueSpan.innerText = `${value} / ${total}`;
                            wrapper.appendChild(valueSpan);
                            return wrapper.outerHTML;
                        },
                    },
                },
            ],
            title: {
                text: '',
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
            setAiSummary(`No exceptions for ${dashboardChartTitleFormat(selectedSubprocess)} in the ${timeframe}.`);
        }
    }, [exceptions, selectedSubprocess, shouldShowCaseInsights, timeframe]);

    return (
        <div className={clsx('bg-white flex flex-col min-h-[600px] lg:flex-row gap-4 pt-6')}>
            <div className="basis-1/3 flex flex-col gap-4 items-start">
                <div>
                    <Typography variant={TypographyVariant.H3}>{dashboardChartTitleFormat(selectedSubprocess, false)}</Typography>
                    <Typography variant={TypographyVariant.Label}>Exception Distribution</Typography>
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
                            text={`View all ${dashboardChartTitleFormat(selectedSubprocess)} exceptions`}
                        />
                    </>
                )}
            </div>
            <div className="basis-2/3 pt-4 flex flex-col">
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
                                No exceptions for {dashboardChartTitleFormat(selectedSubprocess)} in the {timeframe}
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
