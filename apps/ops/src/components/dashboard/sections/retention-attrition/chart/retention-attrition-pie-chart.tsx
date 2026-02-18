import { SeriesOptionsType } from 'highcharts';

import { PieChart } from '@deps/components/dashboard/charts/pie-charts/pie-chart';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';

import styles from './retention-attrition-pie-chart.module.css';
import { useRetentionAttrition } from '../context/retention-attrition-context';

export const colors = [
    'var(--color-base-icon-action-text-link, #00628B)',
    '#021936',
];

export const RetentionAttritionPieChart = () => {
    const { pieSeries, retentionAttritionPieDataFetching, pieInformation } =
        useRetentionAttrition();

    const hasData = pieSeries[0]?.data.length > 0;
    if (!hasData && !retentionAttritionPieDataFetching) {
        return null;
    }

    return (
        <div
            className={`${sharedStyles.pieChartColumn} ${styles.pieChartContainer}`}
        >
            <BlurOverlayLoader loading={retentionAttritionPieDataFetching}>
                {hasData && (
                    <div className={styles.pieChartInformation}>
                        <h1 className={styles.chartTitle}>
                            {pieInformation.title}
                        </h1>
                        <p className={styles.chartDescription}>
                            {pieInformation.description}
                        </p>
                    </div>
                )}

                <PieChart
                    colors={colors}
                    series={pieSeries as SeriesOptionsType[]}
                    showPercentage
                />
            </BlurOverlayLoader>
        </div>
    );
};
