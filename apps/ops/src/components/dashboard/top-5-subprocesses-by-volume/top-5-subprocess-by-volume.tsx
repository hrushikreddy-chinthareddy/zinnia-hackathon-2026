import clsx from 'clsx';
import dayjs from 'dayjs';
import * as Highcharts from 'highcharts';
import HC_ACCESSIBILITY from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useMemo, useRef, useState } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
// import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseDashboardStats } from '@deps/queries/api/cases';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import { getTop5Products, sortCountsByMonth, Top5SubprocessByVolumeProps } from './top-5-subprocess-by-volume.helper';

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts);
    HC_ACCESSIBILITY(Highcharts);
}

export const Top5SubprocessByVolume = ({
    startDate,
    timeframe = '',
    processSubType,
}: // carrierOrBrokerDealer = GroupByOptions.Carrier,
Top5SubprocessByVolumeProps) => {
    const [loading, setLoading] = useState(true);
    const [exceptionData, setExceptionData] = useState<DashboardResponseData[]>();
    const chartRef = useRef<HighchartsReact.RefObject>(null);

    const chartConfig: Highcharts.Options = useMemo((): Highcharts.Options => {
        // console.log(carrierOrBrokerDealer);
        if (!exceptionData) return {};

        const top5Products = getTop5Products(exceptionData);
        const productsToDisplay = top5Products.map(product => product.name);
        const carrierData = [] as Highcharts.SeriesOptionsType[];

        exceptionData.map(value => {
            if (!value || !value.values || !value.name) return;

            const productName = value.name;

            if (productName === 'NULL_VALUE') return;

            if (!productsToDisplay.includes(productName)) return;

            const formattedValues = sortCountsByMonth(value.values);
            const chartData = Array(12).fill(0);
            Object.entries(formattedValues).map(([month, count]) => {
                const idx = parseInt(month, 10);
                const daysInMonth = dayjs(month, 'MM YYYY').daysInMonth();
                const average = count / daysInMonth;
                chartData[idx] = average;
            });
            if (!formattedValues) return;
            carrierData.push({
                type: 'line',
                name: value.name,
                data: chartData,
            });
        });

        return {
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
            // legend: {
            //     title: {
            //         text: 'Carrier: Avg Monthly Nigos / Total Cases',
            //     },
            //     enabled: true,
            //     align: 'left',
            //     verticalAlign: 'top',
            //     layout: 'vertical',
            //     // labelFormatter: function () {
            //     //     const carrier = this.name;
            //     //     const total = exceptionData?.totalCasesByCarrier[carrier];
            //     //     const monthly = exceptionData?.monthly[carrier];
            //     //     if (!total || !monthly) {
            //     //         return DEFAULT_ERROR_STRING;
            //     //     }
            //     //     const totalMonths = exceptionData.totalMonths;
            //     //     const avgTotalCases = total ? Math.round(total / totalMonths) : DEFAULT_ERROR_STRING;
            //     //     const avgMonthlyNigos = monthly?.length
            //     //         ? Math.round(monthly.reduce((prevValue: number, value: number | null) => prevValue + (value || 0), 0) / totalMonths)
            //     //         : DEFAULT_ERROR_STRING;
            //     //     return `${carrier}: ${avgMonthlyNigos} / ${avgTotalCases}`;
            //     // },
            // },
            // xAxis: {
            //     min: dayjs().year(year).month(month).unix() * 1000,
            //     // startOnTick: true,
            //     alignTicks: true,
            //     tickInterval: 24 * 3600 * 1000 * 30,
            //     top: '-40%',
            //     type: 'datetime',
            //     tickWidth: 0,
            //     gridLineWidth: 1,
            //     tickPosition: 'inside',
            //     showLastLabel: true,
            // },
            // ],
            legend: {
                enabled: false,
            },
            plotOptions: {
                series: {
                    connectNulls: false,
                    marker: {
                        enabled: false,
                    },
                },
                column: {
                    stacking: 'percent',
                    pointWidth: 20,
                },
            },
            xAxis: {
                labels: {
                    formatter: function () {
                        return dayjs()
                            .month(this.value as number)
                            .format('MMM YY');
                    },
                },
            },
            yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                    text: 'Average products closed/day',
                },
                lineWidth: 2,
                resize: {
                    enabled: true,
                },
                opposite: true,
            },
            series: carrierData,
            title: {
                text: '',
            },
        };
    }, [exceptionData]);

    useEffect(() => {
        const fetchData = async () => {
            let ignore = false;
            setLoading(true);
            try {
                const { data } = await getCaseDashboardStats({
                    filter: {
                        createdDateStart: startDate,
                        process: [Processes.NewBusiness],
                        requestSubType: [processSubType ?? ''],
                        caseStatus: [Statuses.Completed],
                    },
                    groupBy: [GroupByOptions.ProductName, GroupByOptions.UpdatedAt],
                });
                if (!data) return;
                if (data && Array.isArray(data)) {
                    if (ignore) return;
                    setExceptionData(data);
                    setLoading(false);
                }
            } catch (e) {
                console.error('Error fetching chart data', e);
            } finally {
                setLoading(false);
            }

            return () => {
                ignore = true;
            };
        };

        fetchData();
    }, [processSubType, startDate]);

    return (
        <CardContainer containerClassNames="rounded !p-8 flex flex-col gap-4" classNames="!p-0" fullWidth={true}>
            <Typography className="mb-1" variant={TypographyVariant.H2}>
                {'Top 5 Products by Volume'}
            </Typography>
            <div className="w-full bg-white p-4 rounded flex gap-4">
                <div className="basis-1/3">
                    {!loading && !!exceptionData && (
                        <>
                            <div className="flex flex-row justify-between gap-2">
                                <Typography variant={TypographyVariant.BodyBold}>Product</Typography>
                                <Typography variant={TypographyVariant.BodyBold}>Count</Typography>
                            </div>
                            {getTop5Products(exceptionData).map(item => (
                                <div key={item.name} className="flex flex-row justify-between gap-2">
                                    <Typography variant={TypographyVariant.Body}>{item.name}</Typography>
                                    <Typography variant={TypographyVariant.Body}>{item.count}</Typography>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <div
                    style={{ height: '600px' }}
                    className={clsx('w-full h-[600px] basis-2/3', {
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
                                // <pre>{JSON.stringify(exceptionData, null, 2)}</pre>
                                <div className="flex flex-col gap-2 items-center">
                                    <ChartBarsIcon height={'24px'} width={'24px'} />
                                    <Typography variant={TypographyVariant.BodyBold}>No exceptions in the {timeframe}</Typography>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </CardContainer>
    );
};
