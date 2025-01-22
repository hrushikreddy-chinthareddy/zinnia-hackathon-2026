import Highcharts from 'highcharts';
import more from 'highcharts/highcharts-more';
// import accessibility from 'highcharts/modules/accessibility';
import HighchartsReact from 'highcharts-react-official';
import { useState, useEffect, useCallback } from 'react';

import caseChartHelpers from '@deps/helpers/dashboard/case-chart-helpers';
import { CaseDashboardStatsResponse } from '@deps/models/case/case';

interface Props {
    className?: string;
    seriesLabel?: string;
    dashboardStatsResponse?: CaseDashboardStatsResponse;
    showInLegend?: boolean;
    height?: number;
    width?: number;
    fullWidth?: boolean;
    sort?: boolean;
    chartConfigOverrides?: Highcharts.Options;
}

export const getPieChartData = (dashboardStatsResponse?: CaseDashboardStatsResponse) => {
    const chartData: { name: string; y: number; totalCount: number }[] = [];

    if (!dashboardStatsResponse || !dashboardStatsResponse.data || dashboardStatsResponse.data.length === 0) {
        return chartData;
    }
    const totalCount = dashboardStatsResponse.data.reduce((prevValue, statElement) => prevValue + statElement.count, 0);
    dashboardStatsResponse.data.forEach(statElement => {
        chartData.push({
            name: statElement.name,
            y: statElement.count / totalCount,
            totalCount: statElement.count,
        });
    });

    return chartData;
};

const DistributionPieChartSmallAPIBased = ({
    className,
    dashboardStatsResponse,
    showInLegend = true,
    seriesLabel = 'Cases',
    width,
    height,
    sort = true,
    chartConfigOverrides,
}: Props) => {
    const [chartConfig, setChartConfig] = useState({});

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
        more(Highcharts);
        // accessibility(Highcharts);
    }, []);

    useEffect(() => {
        const chartData = getPieChartData(dashboardStatsResponse);
        const baseConfig = getBaseConfig(showInLegend);
        const config = getChartConfig(chartData, baseConfig);
        setChartConfig({ ...config, ...chartConfigOverrides });
    }, [dashboardStatsResponse, getChartConfig, showInLegend, getBaseConfig, chartConfigOverrides]);

    return (
        <div className={className}>
            <HighchartsReact highcharts={Highcharts} options={chartConfig} />
        </div>
    );
};

export default DistributionPieChartSmallAPIBased;
