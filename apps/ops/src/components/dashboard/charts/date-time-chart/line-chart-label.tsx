import { renderToStaticMarkup } from 'react-dom/server';

import {
    calculateTooltipRanges,
    getTooltipData,
} from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { LabelComponent } from '@deps/components/dashboard/charts/date-time-chart/label-for-chart-for-time/label';

type TooltipOptions = {
    timerange: { from: string; to: string };
    isTooltipColorCircle: boolean;
};

export const tooltipFormatter = (
    options: TooltipOptions
): Highcharts.TooltipFormatterCallbackFunction =>
    function (this: Highcharts.TooltipFormatterContextObject) {
        const points = this.points;
        const dateStr = calculateTooltipRanges(this, options.timerange);
        const tooltipData = getTooltipData(points) || '';

        return renderToStaticMarkup(
            <LabelComponent
                labelData={tooltipData.labelData}
                dateStr={dateStr}
                total={tooltipData.total ?? 0}
                isTooltipColorCircle={options.isTooltipColorCircle}
            />
        );
    };
