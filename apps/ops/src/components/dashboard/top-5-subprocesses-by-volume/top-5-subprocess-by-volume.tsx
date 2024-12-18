import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useMemo } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat, splitAndSentenceCase } from '@deps/helpers/dashboard/dashboard-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseInsights } from '@deps/queries/api/openai';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

import styles from './top-5-subprocess-by-volume.module.css';
import { LineAndVolumeCategoryChart, processGroupedData } from '../line-and-volume-category-chart/line-and-volume-category-chart';

const CHART_HEIGHT = 500;
if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
}

type Summary = {
    series: Highcharts.SeriesLineOptions | Highcharts.SeriesColumnOptions;
    name: string;
    total: number;
};

type Output = {
    weekly: Record<string, Summary>;
    monthly: Record<string, Summary>;
    weeklyCategories: string[];
    monthlyCategories: number[];
};

const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

export const Top5SubprocessByVolume = ({
    createdDateStart,
    requestSubType = 'NB_REG60',
}: {
    createdDateStart: string;
    carrierOrBrokerDealer?: GroupByOptions.Carrier | GroupByOptions.BrokerDealerName;
    requestSubType: string;
}) => {
    const shouldShowCaseInsights = useCaseInsightsPermission();
    const groupBy: GroupByOptions = GroupByOptions.ProductName;

    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(state => state);

    const filter: DashboardSearchFilter = useMemo(() => {
        return {
            createdDateStart: dayjs(createdDateStart).toISOString(),
            process: [Processes.NewBusiness],
            caseStatus: [Statuses.Completed],
            carrier: Object.keys(selectedCarriers),
            brokerDealerName: Object.keys(selectedBrokerDealers),
            ...(requestSubType ? { requestSubType: [requestSubType] } : {}),
        };
    }, [createdDateStart, requestSubType, selectedBrokerDealers, selectedCarriers]);

    const { data: statsResponse, isLoading: loading } = useQuery({
        queryKey: ['getTopFiveData', filter, groupBy],
        queryFn: async () => {
            const data = await getCaseDashboardStatsQuery(filter, [groupBy, GroupByOptions.UpdatedAt]);

            if (!data.data?.length) {
                throw data;
            }
            return data;
        },
    });

    const {
        data: aiSummaryResponse,
        isLoading: aiLoading,
        isError: aiError,
    } = useQuery({
        queryKey: ['getAiSummary', filter, statsResponse?.data, requestSubType],
        queryFn: () =>
            getCaseInsights({
                content: JSON.stringify(statsResponse?.data),
                prompt: `You are an expert in all things new business application data. Your job is to summarize the data for business and executive users. They want simple and insightful information about the data provided to you. The data provided to you here are completed ${dashboardChartTitleFormat(
                    requestSubType,
                    false
                )} applications, but the ${dashboardChartTitleFormat(
                    requestSubType,
                    false
                )} applications encountered exceptions along their path to completion. The data is grouped by Carrier and then by Exception Category and the values represent an exception that occurred for a ${dashboardChartTitleFormat(
                    requestSubType,
                    false
                )} application. Avoid using phrases such as "the data". Your responses should be insightful and will be displayed on a UI as a summary for a module related to a distribution chart. Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to U.S. inclding commas where appropriate.`,
            }),
        enabled: shouldShowCaseInsights && !!statsResponse?.data?.length && !!requestSubType.length,
    });

    const summary = useMemo(() => {
        if (aiError) return 'Sorry, there was a problem loading data...';
        if (aiSummaryResponse?.length) return aiSummaryResponse;
        if (!statsResponse?.data?.length) return `No exceptions for ${dashboardChartTitleFormat(requestSubType)}.`;
        return 'Sorry, there was a problem loading data...';
    }, [aiSummaryResponse, aiError, statsResponse?.data?.length, requestSubType]);

    const noStatsData = !statsResponse?.data?.length;
    const processedData = useMemo(() => {
        if (noStatsData) return null;
        const processedData = processGroupedData(statsResponse?.data || []);
        return processedData;
    }, [statsResponse?.data, noStatsData]);

    const sortedMonthlyArray = useMemo(() => {
        if (!processedData) return [];
        const monthlyArray: Summary[] = [];
        Object.entries(processedData.monthlyByLevel1Grouping).forEach(([, value]) => {
            monthlyArray.push(value);
        });
        return monthlyArray.sort((a, b) => b.total - a.total).slice(0, 5);
    }, [processedData]);

    return (
        <CardContainer containerClassNames="rounded" classNames="!p-0" fullWidth={true}>
            <div className="flex flex-col xl:flex-row justify-between gap-8 w-full">
                <div className="flex xl:flex-col xl:w-1/4 gap-4 mb-8 xl:mb-0">
                    <div>
                        <Typography variant={TypographyVariant.H3}>{'Top 5 Products'}</Typography>
                        <Typography variant={TypographyVariant.Label}> {dashboardChartTitleFormat(requestSubType, false)} </Typography>
                    </div>
                    <div className="flex-1 border-r-1 xl:border-r-0 border-[#EDEDED] flex flex-col gap-4">
                        {aiLoading ? (
                            <div className="grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                                <PageLoader />
                            </div>
                        ) : (
                            <>
                                <div className="flex flow-col items-center align-middle gap-2">
                                    <LightBulbIcon height={'24px'} width={'24px'} />
                                    <Typography variant={TypographyVariant.LabelLg}>Insight</Typography>
                                </div>
                                <Typography variant={TypographyVariant.BodySm}>{summary}</Typography>
                            </>
                        )}
                        <table>
                            <thead>
                                <tr>
                                    <th className={`text-left ${styles.th}`}>{splitAndSentenceCase(groupBy)}</th>
                                    <th className={`text-right ${styles.th}`}>Monthly Avg. / Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMonthlyArray.map((stat, index) => (
                                    <tr key={`stat-${index}-${stat.name}`}>
                                        <td className="text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-3" style={{ backgroundColor: colors[index] }}>
                                                    <span className="sr-only">color indicator for {stat.name}</span>
                                                </div>
                                                <NavElement
                                                    href={`/cases${convertToQueryString(filter as any)}`}
                                                    size={NavElementSize.Small}
                                                    type={NavElementType.Link}
                                                    className={`capitalize ${styles.ellipsis}`}
                                                    target="_blank"
                                                >
                                                    {stat.name}
                                                </NavElement>
                                            </div>
                                        </td>
                                        <td className={`text-right ${styles.value}`}>
                                            {wholeNumberFormatify(stat.total / 12)} / {wholeNumberFormatify(stat.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="relative xl:w-3/4">
                    <div
                        style={{
                            height: `${CHART_HEIGHT}px`,
                        }}
                        className={clsx('w-full', {
                            'grid gap-4 place-content-center bg-[--color-base-surface-surface-tertiary]':
                                loading || !statsResponse?.data?.length,
                        })}
                    >
                        {loading ? (
                            <>
                                <PageLoader />
                                <Typography variant={TypographyVariant.BodyBold}>Loading...</Typography>
                            </>
                        ) : (
                            <>
                                {statsResponse?.data?.length ? (
                                    <LineAndVolumeCategoryChart chartData={processedData}></LineAndVolumeCategoryChart>
                                ) : (
                                    <div style={{ minHeight: `${CHART_HEIGHT}px` }} className="flex flex-col gap-2 items-center">
                                        <ChartBarsIcon height={'24px'} width={'24px'} />
                                        <Typography variant={TypographyVariant.BodyBold}>Chart unavailable</Typography>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </CardContainer>
    );
};
