import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import { useMemo } from 'react';

import styles from '@deps/components/dashboard/top-5-subprocesses-by-volume/top-5-subprocess-by-volume.module.css';
import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseInsights } from '@deps/queries/api/openai';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getStatsData } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';
import { ReactComponent as LightBulbIcon } from '@deps/styles/elements/icons/illustrations/light-bulb.svg';

import NavElement, { NavElementSize, NavElementType } from '../../nav-element/nav-element';
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

const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

interface Props {
    selectedSubprocess: string;
    legendLabel: string;
    title: string;
    filters: DashboardSearchFilter;
    groupByOptions: GroupByOptions[];
}

export const CaseTimeseries = ({ selectedSubprocess = 'NB_REG60', legendLabel, title, filters, groupByOptions }: Props) => {
    const shouldShowCaseInsights = useCaseInsightsPermission();
    const { data: caseTimeseriesData, isLoading: caseTimeseriesDataLoading } = useQuery({
        queryKey: ['caseTimeseriesData', filters, groupByOptions],

        queryFn: async () => {
            const data = await getStatsData(filters, groupByOptions);
            if (!data?.data?.statsResponseData) {
                throw data;
            }
            return data;
        },
    });

    const noData = !caseTimeseriesData?.data?.statsResponseData?.length;
    const processedData = useMemo(() => {
        if (noData) {
            return null;
        }
        const processedData = processGroupedData(caseTimeseriesData?.data.statsResponseData || []);
        return processedData;
    }, [caseTimeseriesData?.data.statsResponseData, noData]);

    const sortedMonthlyArray = useMemo(() => {
        if (!processedData) {
            return [];
        }
        const monthlyArray: Summary[] = [];
        Object.entries(processedData.monthlyByLevel1Grouping).forEach(([, value]) => {
            monthlyArray.push(value);
        });
        return monthlyArray.sort((a, b) => b.total - a.total).slice(0, 5);
    }, [processedData]);

    const {
        data: insight,
        isLoading: insightLoading,
        isError: insightError,
    } = useQuery({
        queryKey: ['getAiSummary', caseTimeseriesData?.data?.statsResponseData, selectedSubprocess],
        queryFn: async () => {
            try {
                const summary = await getCaseInsights({
                    content: JSON.stringify(caseTimeseriesData?.data?.statsResponseData),
                    prompt: `You are an expert in all things new business application data. Your job is to summarize the data for business and executive users. They want simple and insightful information about the data provided to you. The data provided to you here are completed ${dashboardChartTitleFormat(
                        selectedSubprocess,
                        false
                    )} applications, but the ${dashboardChartTitleFormat(
                        selectedSubprocess,
                        false
                    )} applications encountered exceptions along their path to completion. The data is grouped by Carrier and then by Exception Category and the values represent an exception that occurred for a ${dashboardChartTitleFormat(
                        selectedSubprocess,
                        false
                    )} application. Avoid using phrases such as "the data". Your responses should be insightful and will be displayed on a UI as a summary for a module related to a distribution chart. Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to U.S. including commas where appropriate.`,
                });
                return summary;
            } catch (error) {
                return '';
            }
        },
        enabled: shouldShowCaseInsights,
    });

    const aiInsights = useMemo(() => {
        if (insightError) {
            return 'Insight data is currently unavailable.';
        }
        if (insight) {
            return insight;
        }
        if (!caseTimeseriesData?.data?.statsResponseData?.length) {
            return `No data for ${dashboardChartTitleFormat(selectedSubprocess)}.`;
        }
        return 'Insight data is currently unavailable.';
    }, [insightError, insight, caseTimeseriesData?.data?.statsResponseData?.length, selectedSubprocess]);

    return (
        <CardContainer containerClassNames="rounded" classNames="!p-0" fullWidth={true}>
            <div className="flex flex-col xl:flex-row justify-between gap-8 w-full">
                <div className="flex xl:flex-col xl:w-1/4 gap-4 mb-8 xl:mb-0">
                    <Typography variant={TypographyVariant.H3}>{title}</Typography>
                    {/* {<pre>{JSON.stringify(caseVolumeTimeseriesData?.data?.statsResponseData, null, 2)}</pre>} */}
                    <Typography variant={TypographyVariant.Label}>{dashboardChartTitleFormat(selectedSubprocess)}</Typography>
                    <div className="flex-1 border-r-1 xl:border-r-0 border-[#EDEDED] flex flex-col gap-4 pt-4">
                        {insightLoading ? (
                            <div className="grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                                <PageLoader />
                            </div>
                        ) : (
                            <>
                                <div className="flex flow-col items-center align-middle gap-2">
                                    <LightBulbIcon height={'24px'} width={'24px'} />
                                    <Typography variant={TypographyVariant.LabelLg}>Insight</Typography>
                                </div>
                                <Typography variant={TypographyVariant.BodySm}>{aiInsights}</Typography>
                            </>
                        )}
                        <table>
                            <thead>
                                <tr>
                                    <th className={`text-left ${styles.th}`}>{legendLabel}</th>
                                    <th className={`text-right ${styles.th}`}>Monthly Avg.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMonthlyArray.map((stat, index) => (
                                    <tr key={`stat-${index}-${stat.name}`}>
                                        <td className="text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="h-3 w-3" style={{ backgroundColor: colors[index] }}></div>
                                                <NavElement
                                                    href={`/cases${convertToQueryString(filters as any)}`}
                                                    size={NavElementSize.Small}
                                                    type={NavElementType.Link}
                                                    className="capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[175px] block"
                                                    target="_blank"
                                                    title={stat.name}
                                                >
                                                    {stat.name}
                                                </NavElement>
                                            </div>
                                        </td>
                                        <td className={`text-right ${styles.value}`}>{wholeNumberFormatify(stat.total / 12)} cases</td>
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
                            [`grid gap-4 place-content-center bg-[--color-base-surface-surface-tertiary]`]:
                                caseTimeseriesDataLoading || !caseTimeseriesData || !processedData,
                        })}
                    >
                        {caseTimeseriesDataLoading || !processedData ? (
                            <>
                                <PageLoader />
                                <Typography variant={TypographyVariant.BodyBold}>Loading...</Typography>
                            </>
                        ) : (
                            <>
                                {caseTimeseriesData ? (
                                    <LineAndVolumeCategoryChart chartData={processedData || {}}></LineAndVolumeCategoryChart>
                                ) : (
                                    <div className="flex flex-col gap-2 items-center bg-red-400">
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
