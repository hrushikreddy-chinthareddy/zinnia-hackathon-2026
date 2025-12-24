import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';

type AnalyticsHeaderProps = {
    isLoading: boolean;
    total: number;
    chartName: string;
    titleToolTip?: ReactNode;
};

const AnalyticsHeader = (props: AnalyticsHeaderProps) => {
    const { isLoading, total, chartName, titleToolTip } = props;

    const { t } = useTranslation();

    const subtitle = (
        <div className={`${isLoading ? 'blur' : ''}`}>
            <p className={'typography-titles-subtitle'}>
                {total.toLocaleString()} {t(`allFields.${chartName}Unit`)}
            </p>
        </div>
    );

    return (
        <>
            <ChartHeader
                title={t(`allFields.${chartName}Title`)}
                subtitle={subtitle}
                description={t(`allFields.${chartName}Description`)}
                titleToolTip={titleToolTip}
            />
            {/* Export button: DEPU-8474 */}
        </>
    );
};

export default AnalyticsHeader;
