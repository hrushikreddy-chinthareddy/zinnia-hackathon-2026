import Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
// import accessibility from 'highcharts/modules/accessibility';
import HighchartsReact from 'highcharts-react-official';
import { useState, useEffect, useCallback } from 'react';

import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { DashboardStatsElementResponse } from '@deps/models/case/case';

//https://www.npmjs.com/package/highcharts-react-official#highcharts-with-nextjs
if (typeof Highcharts === 'object') {
    more(Highcharts);
}

interface Props {
    className?: string;
    seriesLabel?: string;
    statGrouping?: DashboardStatsElementResponse;
    showInLegend?: boolean;
    height?: number;
    width?: number;
    fullWidth?: boolean;
    sort?: boolean;
}

const DistributionPieChartSmall = ({
    className,
    statGrouping,
    showInLegend = true,
    seriesLabel = 'Cases',
    width,
    height,
    sort = true,
}: Props) => {
    const [chartConfig, setChartConfig] = useState({});
    const getChartData = (statsGrouping?: DashboardStatsElementResponse) => {
        const chartData: { name: string; y: number; totalCount: number }[] = [];
        if (!statsGrouping || !statsGrouping.values || statsGrouping.values.length === 0) {
            return chartData;
        }
        statsGrouping.values.forEach(statGrouping => {
            chartData.push({
                name: dashboardChartTitleFormat(statGrouping.name),
                y: statGrouping.count / statsGrouping.count,
                totalCount: statGrouping.count,
            });
        });

        return chartData;
    };

    const getBaseConfig = useCallback(
        (showInLegend: boolean) => {
            const config: Highcharts.Options = caseChartHelpers.getBaseSmallPieConfiguration();

            if (config.chart && height) {
                config.chart.height = height;
            }
            if (config.chart && width) {
                config.chart.width = width;
            }
            if (config.chart && config.plotOptions && config.plotOptions?.pie) {
                config.plotOptions.pie.showInLegend = showInLegend;
                if (!showInLegend) {
                    config.chart.margin = [0, 0, 0, 0];
                    config.chart.spacing = [10, 10, 10, 10];
                }
            }
            return config;
        },
        [height, width]
    );

    const getChartConfig = useCallback(
        (chartData: { name: string; y: number }[], baseConfig: Highcharts.Options) => {
            const config = Highcharts.merge(baseConfig, {
                series: [
                    {
                        name: seriesLabel,
                        data: sort ? chartData.sort((a, b) => b.y - a.y) : chartData,
                    },
                ],
            });

            return config;
        },
        [seriesLabel, sort]
    );

    useEffect(() => {
        const chartData = getChartData(statGrouping);
        const baseConfig = getBaseConfig(showInLegend);
        const config = getChartConfig(chartData, baseConfig);
        setChartConfig(config);
    }, [statGrouping, getChartConfig, showInLegend, getBaseConfig]);

    return (
        <div className={className}>
            <HighchartsReact highcharts={Highcharts} options={chartConfig} />
        </div>
    );
};

export default DistributionPieChartSmall;
