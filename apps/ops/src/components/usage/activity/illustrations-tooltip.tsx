import { renderToStaticMarkup } from 'react-dom/server';
import { useTranslation } from 'react-i18next';

import { getTooltipData } from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { LabelComponent } from '@deps/components/dashboard/charts/date-time-chart/label-for-chart-for-time/label';

export const IllustrationsActivityTooltip = () => {
    const { t } = useTranslation();

    return <p>{t('usage.activity.illustrationsActivity.tooltip')}</p>;
};

export const tooltipFormatter: Highcharts.TooltipFormatterCallbackFunction =
    function (this) {
        const points = this.points;
        const tooltipData = getTooltipData(points) || '';

        return renderToStaticMarkup(
            <LabelComponent
                labelData={tooltipData.labelData}
                dateStr={''}
                total={tooltipData.total ?? 0}
                isTooltipColorCircle={false}
            />
        );
    };
