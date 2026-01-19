import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HC_TREEMAP from 'highcharts/modules/treemap';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useRef, useState } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import {
    DASHBOARD_DEFAULT_LABEL,
    DASHBOARD_REPLACE_LABELS,
} from '@deps/helpers/dashboard/dashboard-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helpers';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import styles from '@deps/pages/analytics/Dashboard.module.css';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';
import {
    ExceptionCountGroupByEnum,
    ExceptionCountOutput,
    ExceptionCountOutputLevel1,
} from '@zinnia/api-types/types/analytics';

const CHART_HEIGHT = 500;

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
    HC_TREEMAP(Highcharts);
}

export type TreeMapInsightsProps = {
    dashboardStatsData?: ExceptionCountOutput;
    heading: string;
    carrierOrBrokerDealer?:
        | ExceptionCountGroupByEnum.CARRIER
        | ExceptionCountGroupByEnum.BROKER_DEALER_NAME;
    FilterComponents: React.ReactNode;
};

export const TreeMapInsights = ({
    dashboardStatsData,
    heading,
    FilterComponents,
}: TreeMapInsightsProps) => {
    const chartCompomentRef = useRef<HighchartsReact.RefObject>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const shouldShowCaseInsights = useCaseInsightsPermission();
    const [loading, setLoading] = useState(false);

    // TODO: add context for secondary and tertiary groupings if applicable
    const getOpenAiSummary = async (
        caseStats: ExceptionCountOutputLevel1[]
    ) => {
        try {
            setLoading(true);
            const summary = await getCaseInsights({
                content: JSON.stringify(caseStats),
                prompt: `You are an expert in all things new business application data. Your job is to summarize the data for business and executive users. Avoid using phrases such as "the data". In your response, replace "exception" with "NIGO" and "exceptions" to "NIGOs". Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to U.S. Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
            });
            setLoading(false);
            return summary;
        } catch (error) {
            return '';
        }
    };

    const seriesData = dashboardStatsData?.data; // this will change once filters are added

    const noData =
        !seriesData ||
        seriesData?.length === 0 ||
        dashboardStatsData?.totalElements === 0;

    // this is the same code that is found in exception-insights.tsx
    const chartOptions: Highcharts.Options = useMemo(() => {
        const chartData: Highcharts.SeriesTreemapOptions['data'] =
            seriesData?.map((item) => ({
                name: DASHBOARD_REPLACE_LABELS.includes(item.name)
                    ? DASHBOARD_DEFAULT_LABEL
                    : item.name,
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
                            const value = (this.point as any).value;
                            const dataLabel = (this.point as any).dataLabel;
                            const shape = this.point.shapeArgs;
                            const seriesValues: Array<number> = (
                                this.series as any
                            ).valueData;
                            const total = seriesValues.reduce(
                                (sum, val) => sum + val,
                                0
                            );
                            const len = (Number(value) / total) * 100;
                            const wrapper = document.createElement('div');
                            wrapper.style.backgroundColor =
                                'var(--color-base-surface-surface-primary)';
                            wrapper.classList.add(
                                'rounded',
                                'typography-content-body'
                            );
                            wrapper.style.color =
                                'var(--color-base-text-text-primary)';
                            wrapper.style.margin =
                                'var(--measure-dimension-margin-sm)';
                            wrapper.style.fontFamily =
                                'var(--font-family-secondary)';
                            wrapper.style.fontSize = '11px';
                            wrapper.style.overflow = 'hidden';
                            wrapper.style.textOverflow = 'ellipsis';

                            wrapper.style.margin =
                                'var(--measure-dimension-padding-xs)';
                            wrapper.style.padding =
                                'var(--measure-dimension-padding-xs)';
                            wrapper.style.alignItems = 'center';
                            const nameSpan = document.createElement('span');
                            // const valueSpan = document.createElement('span');
                            nameSpan.innerText = name;

                            //TODO: For some reason, dataLabel can be undefined sometimes and cause issues
                            if (
                                dataLabel?.width + dataLabel?.padding >=
                                shape?.width
                            ) {
                                wrapper.style.whiteSpace = 'break-spaces';
                            }
                            if (
                                len < 1 ||
                                dataLabel?.height + dataLabel?.padding >=
                                    shape?.height
                            ) {
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
                    wrapper.style.backgroundColor =
                        'var(--color-base-surface-surface-primary)';
                    wrapper.classList.add('rounded', 'typography-content-body');
                    wrapper.style.color = 'var(--color-base-text-text-primary)';
                    wrapper.style.padding =
                        'var(--measure-dimension-padding-lg)';
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
                    const total = seriesValues.reduce(
                        (sum, val) => sum + val,
                        0
                    );
                    const ratio = `${value} / ${total}`;

                    nameSpan.innerText = this.point.name;
                    valueSpan.innerText = ratio; //this.point.value;
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
            getOpenAiSummary(seriesData).then((summary) => {
                if (summary) {
                    setAiSummary(summary);
                }
            });
        } else {
            setAiSummary('There are no NIGOs.');
        }
    }, [seriesData, shouldShowCaseInsights]);

    return (
        <div className={clsx('bg-white')}>
            <ChartHeader
                title={heading}
                subtitle={`There are ${wholeNumberFormatify(
                    dashboardStatsData?.totalElements
                )} NIGOs`}
            />

            <div className="flex flex-col lg:flex-row gap-4 mt-6">
                <div className="w-1/4 flex flex-col gap-4 items-start">
                    {loading ? (
                        <div className="grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                            <PageLoader />
                        </div>
                    ) : (
                        <>
                            {!!aiSummary?.length && (
                                <>
                                    <div className="flex flow-col items-center align-middle gap-2">
                                        <LightBulbIcon
                                            height={'24px'}
                                            width={'24px'}
                                        />
                                        <Typography
                                            variant={TypographyVariant.LabelLg}
                                        >
                                            Insight
                                        </Typography>
                                    </div>
                                    <Typography
                                        variant={TypographyVariant.BodySm}
                                    >
                                        {aiSummary}
                                    </Typography>
                                </>
                            )}
                        </>
                    )}
                </div>
                <div className={sharedStyles.chartContainer}>
                    <div>{FilterComponents}</div>
                    <div
                        className={clsx(
                            `w-full h-[${CHART_HEIGHT}px]`,
                            noData &&
                                'grid gap-4 place-content-center bg-[--color-base-surface-surface-tertiary]'
                        )}
                    >
                        {noData ? (
                            <div className="flex flex-col gap-2 items-center">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                <Typography
                                    variant={TypographyVariant.BodyBold}
                                >
                                    There are no NIGOs
                                </Typography>
                            </div>
                        ) : (
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={chartOptions}
                                ref={chartCompomentRef}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
