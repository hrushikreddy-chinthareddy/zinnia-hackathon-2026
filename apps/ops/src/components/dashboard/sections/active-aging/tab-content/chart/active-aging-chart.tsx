import { generateNewColor } from '@zinnia/utils';
import clsx from 'clsx';
import { SeriesOptionsType } from 'highcharts';
import { useContext, useMemo } from 'react';

import { StackedColumnChart } from '@deps/components/dashboard/charts/bar-charts/stacked-column-chart';
import { PieChart } from '@deps/components/dashboard/charts/pie-charts/pie-chart';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { Legend } from '@deps/components/dashboard/legend/legend';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import { ActiveAgingContext } from '../../context/active-aging-context';
import { generateActiveAgingCategories } from '../../utils';
import { ActiveAgingFilters } from '../shared/active-aging-filters';
import { ActiveAgingHeader } from '../shared/active-aging-header';

export const colors = [
    '#00628B',
    '#021936',
    '#8593D3',
    '#C18DD6',
    '#D385A5',
    '#BF91BA',
    '#F6AF3B',
    '#FF65A1',
    '#3B82F6',
    '#FF984C',
    '#FF6F82',
];

export const ActiveAgingChart = () => {
    const { timeframe, activeAgingDataFetching, chartSeries, pieSeries, activeAgingDataError } = useContext(ActiveAgingContext);

    const legendItemsNew = useMemo(() => {
        return (
            chartSeries?.map((item, index) => {
                const color = colors[index] ?? generateNewColor(colors);
                if (!colors.includes(color)) {
                    colors.push(color);
                }
                return {
                    label: item.name,
                    color,
                };
            }) || []
        );
    }, [chartSeries]);

    return (
        <div className="flex">
            <div className={clsx(sharedStyles.chartColumn, 'w-3/4')}>
                <CardContainer fullWidth={false}>
                    <ActiveAgingHeader />
                    <ActiveAgingFilters />

                    <BlurOverlayLoader loading={activeAgingDataFetching}>
                        {activeAgingDataError ? (
                            <div className="grid place-content-center h-full w-full min-h-[400px]">
                                <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                    <ChartBarsIcon height={'24px'} width={'24px'} />
                                    {'Something went wrong fetching insights, please try again by refreshing the page'}
                                </Typography>
                            </div>
                        ) : chartSeries?.length === 0 ? (
                            <div className="grid place-content-center h-full w-full min-h-[400px]">
                                <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                    <ChartBarsIcon height={'24px'} width={'24px'} />
                                    {'There is no data for this selection'}
                                </Typography>
                            </div>
                        ) : (
                            <>
                                <StackedColumnChart
                                    series={chartSeries as SeriesOptionsType[]}
                                    categories={generateActiveAgingCategories(timeframe)}
                                    colors={colors}
                                    yAxisTitle="Case Volume"
                                />
                                <Legend items={legendItemsNew} title="Duration of open cases" />
                            </>
                        )}
                    </BlurOverlayLoader>
                </CardContainer>
            </div>
            <div className={clsx('w-1/4 pt-40', sharedStyles.pieChartColumn)}>
                <BlurOverlayLoader loading={activeAgingDataFetching}>
                    <PieChart colors={colors} series={pieSeries as SeriesOptionsType[]} />
                </BlurOverlayLoader>
            </div>
        </div>
    );
};
