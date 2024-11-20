import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import { useMemo, useRef } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { GroupByOptions } from '@deps/models/case/enums';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import useExceptionData from '../../pages/dashboard/issued-business/useExceptionData';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
}

export const ExceptionSummary = ({
    startDate,
    timeframe = '',
    carrierOrBrokerDealer = GroupByOptions.Carrier,
}: {
    startDate: string;
    timeframe?: string;
    carrierOrBrokerDealer?: GroupByOptions.Carrier | GroupByOptions.BrokerDealerName;
}) => {
    const [loading, exceptionData] = useExceptionData({ startDate, carrierOrBrokerDealer });
    const chartRef = useRef<HighchartsReact.RefObject>(null);

    const chartConfig: Highcharts.Options = useMemo(() => {
        if (!exceptionData) return {};
        const year = exceptionData.startYear;
        const month = exceptionData.startMonth;
        let weeklyData: Highcharts.Options['series'] = [];
        let monthlyData: Highcharts.Options['series'] = [];
        if (exceptionData?.weekly) {
            weeklyData = Object.keys(exceptionData.weekly).map(carrier => ({
                name: carrier,
                pointInterval: 24 * 3600 * 1000 * 7,
                color: caseChartHelpers.getColors()[exceptionData.carriers.indexOf(carrier)],
                data: exceptionData.weekly[carrier],
                type: 'line' as const,
                yAxis: 0,
                linkedTo: `column-${carrier}`,
            }));
        }
        if (exceptionData?.monthly) {
            monthlyData = Object.keys(exceptionData.monthly).map(carrier => ({
                name: carrier,
                color: caseChartHelpers.getColors()[exceptionData.carriers.indexOf(carrier)],
                data: exceptionData.monthly[carrier].map((val, index) => {
                    return [dayjs().year(year).month(month).add(index, 'month').startOf('day').startOf('month').unix() * 1000, val];
                }),
                id: `column-${carrier}`,
                type: 'column' as const,
                yAxis: 1,
            }));
        }

        return {
            accessissibility: {
                enabled: true,
            },
            chart: {
                height: 600,
            },
            credits: {
                enabled: false,
            },
            navigation: {
                buttonOptions: {
                    enabled: false,
                },
            },
            title: { text: '' },
            legend: {
                title: {
                    text: 'Carrier: Avg Monthly Nigos / Total Cases',
                },
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
                layout: 'vertical',
                labelFormatter: function () {
                    const carrier = this.name;
                    const total = exceptionData?.totalCasesByCarrier[carrier];
                    const monthly = exceptionData?.monthly[carrier];
                    if (!total || !monthly) {
                        return DEFAULT_ERROR_STRING;
                    }
                    const totalMonths = exceptionData.totalMonths;
                    const avgTotalCases = total ? Math.round(total / totalMonths) : DEFAULT_ERROR_STRING;
                    const avgMonthlyNigos = monthly?.length
                        ? Math.round(monthly.reduce((prevValue: number, value: number | null) => prevValue + (value || 0), 0) / totalMonths)
                        : DEFAULT_ERROR_STRING;
                    return `${carrier}: ${avgMonthlyNigos} / ${avgTotalCases}`;
                },
            },
            xAxis: {
                min: dayjs().year(year).month(month).unix() * 1000,
                // startOnTick: true,
                alignTicks: true,
                tickInterval: 24 * 3600 * 1000 * 30,
                top: '-40%',
                type: 'datetime',
                tickWidth: 0,
                gridLineWidth: 1,
                tickPosition: 'inside',
                showLastLabel: true,
            },
            yAxis: [
                {
                    allowDecimals: false,
                    min: 0,
                    title: {
                        text: 'Weekly Exceptions',
                    },
                    height: '60%',
                    lineWidth: 2,
                    resize: {
                        enabled: true,
                    },
                    opposite: true,
                },
                {
                    allowDecimals: false,
                    min: 0,
                    title: {
                        text: 'Monthly Breakdown',
                    },
                    top: '70%',
                    height: '30%',
                    offset: 0,
                    lineWidth: 2,
                    opposite: true,
                    visible: false,
                },
            ],
            plotOptions: {
                series: {
                    connectNulls: false,
                },
                column: {
                    stacking: 'percent',
                    pointWidth: 20,
                },
            },
            series: [...weeklyData, ...monthlyData],
        };
    }, [exceptionData]);

    return (
        <CardContainer containerClassNames="rounded" classNames="!p-0" fullWidth={true}>
            <Typography className="mb-1" variant={TypographyVariant.H2}>
                {'Exception Summary'}
            </Typography>
            <div
                style={{ height: '600px' }}
                className={clsx('w-full h-[600px]', {
                    'grid gap-4 place-content-center bg-[--color-base-surface-surface-tertiary]': loading || !exceptionData,
                })}
            >
                {loading ? (
                    <>
                        <PageLoader />
                        <Typography variant={TypographyVariant.BodyBold}>Loading...</Typography>
                    </>
                ) : (
                    <>
                        {exceptionData ? (
                            <HighchartsReact ref={chartRef} highcharts={Highcharts} options={chartConfig} />
                        ) : (
                            <div className="flex flex-col gap-2 items-center">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                <Typography variant={TypographyVariant.BodyBold}>No exceptions in the {timeframe}</Typography>
                            </div>
                        )}
                    </>
                )}
            </div>
        </CardContainer>
    );
};
