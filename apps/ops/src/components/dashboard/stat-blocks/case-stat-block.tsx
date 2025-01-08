import clsx from 'clsx';
import { useEffect, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { formatNumberLabel, wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import useCaseInsightsPermission from '@deps/hooks/useCaseInsights';
import { CaseDashboardStatsResponse } from '@deps/models/case/case';
import { getCaseInsights } from '@deps/queries/api/openai';
import { ReactComponent as ChartSquare } from '@deps/styles/elements/icons/icons_outlined/chart-square-bar.svg';
import { ReactComponent as LighBulb } from '@deps/styles/elements/icons/icons_outlined/light-bulb.svg';

import DistributionPieChartSmallAPIBased from '../distribution-charts/distribution-pie-chart-small-api-based';

interface Props {
    dashboardStatsResponse?: CaseDashboardStatsResponse;
    blockLabel: string;
    timeFrameLabel: string;
    classNames?: string;
    statMeasurementLabel: string;
    variant?: 'single' | 'double' | 'full';
    showViewMore?: boolean;
    filterParams?: { [key: string]: string | string[] | number | boolean };
    loading?: boolean;
}

const CaseStatBlock = ({
    dashboardStatsResponse,
    classNames,
    blockLabel,
    timeFrameLabel,
    statMeasurementLabel,
    variant = 'single',
    showViewMore = false,
    filterParams = {},
    loading = true,
}: Props) => {
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const shouldShowCaseInsights = useCaseInsightsPermission();

    const getOpenAiSummary = async (caseStats: CaseDashboardStatsResponse) => {
        try {
            const summary = await getCaseInsights({
                content: JSON.stringify(caseStats),
                prompt: `You are an expert in all things case data. Your job is to summarize the data for business and executive users.
                          They want simple and insightful information about the data provided to you. The cases provided to you here are open cases delineated by insurance carrier. Avoid using phrases such as "the data".
                          Your responses should be insightful and will be displayed on a UI as a summary for a module related to a pie chart. Use percentages and real data where it makes sense. Keep it conscise and to the point. Format number values to U.S. Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
            });
            return summary;
        } catch (error) {
            return '';
        }
    };

    const renderLabel = () => {
        return (
            <div className="flex gap-1">
                <Label label={blockLabel} variant={LabelVariant.LabelMd} />
                <Label label={timeFrameLabel} variant={LabelVariant.LabelSmAlt} />
            </div>
        );
    };

    const getTotalStatValue = () => {
        const value = dashboardStatsResponse?.data?.reduce((prevValue, statElement) => prevValue + statElement.count, 0);
        return value;
    };

    const renderStatValue = () => {
        return (
            <div className="flex gap-1">
                <Content details={wholeNumberFormatify(getTotalStatValue() || 0)} variant={ContentVariant.Value} />
                <Content details={formatNumberLabel(statMeasurementLabel, getTotalStatValue() || 0)} variant={ContentVariant.Value} />
            </div>
        );
    };

    const renderChart = () => {
        return <DistributionPieChartSmallAPIBased dashboardStatsResponse={dashboardStatsResponse} showInLegend={true} />;
    };

    const renderAISummary = () => {
        if (!shouldShowCaseInsights) {
            return null;
        }
        return (
            <>
                <Typography className="flex gap-2 items-center mb-2" variant={TypographyVariant.BodyBold}>
                    <LighBulb height={24} width={24} />
                    <span>Insight</span>
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>{aiSummary ?? 'Generating AI Summary...'}</Typography>
            </>
        );
    };

    const renderShowMore = () => {
        if (!showViewMore) {
            return null;
        }

        return (
            <div className="mt-4 flex items-center gap-1">
                <ChartSquare height={18} width={18} />
                <NavElement
                    href={`/cases${convertToQueryString(filterParams)}`}
                    size={NavElementSize.Small}
                    type={NavElementType.Link}
                    target="_blank"
                >
                    View apps
                </NavElement>
            </div>
        );
    };

    const renderSingleStatBlock = () => {
        return (
            <>
                {renderLabel()}
                {renderStatValue()}
                {renderChart()}
                {renderAISummary()}
                {renderShowMore()}
            </>
        );
    };

    const renderDoubleStatBlock = () => {
        return (
            <div className="flex justify-between">
                <div className="w-1/2">
                    <div className="mb-4">
                        {renderLabel()}
                        {renderStatValue()}
                    </div>
                    {renderAISummary()}
                    {renderShowMore()}
                </div>
                <div className="w-1/2">{renderChart()}</div>
            </div>
        );
    };

    const getWidthClassName = () => {
        switch (variant) {
            case 'double':
                return 'w-1/2';
            case 'full':
                return 'w-full';
            case 'single':
                return 'w-1/4';
            default:
                return '';
        }
    };

    useEffect(() => {
        if (!shouldShowCaseInsights) {
            return;
        }
        if (!loading && dashboardStatsResponse && dashboardStatsResponse.data && dashboardStatsResponse.data.length > 0) {
            getOpenAiSummary(dashboardStatsResponse).then(summary => {
                if (summary) {
                    setAiSummary(summary);
                }
            });
        }
    }, [dashboardStatsResponse, loading, shouldShowCaseInsights]);

    return (
        <CardContainer fullWidth={false} containerClassNames={clsx(classNames, getWidthClassName())}>
            {variant === 'single' && renderSingleStatBlock()}
            {variant === 'double' && renderDoubleStatBlock()}
        </CardContainer>
    );
};

export default CaseStatBlock;
