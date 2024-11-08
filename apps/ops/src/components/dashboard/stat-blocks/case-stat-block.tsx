import clsx from 'clsx';

import Content, { ContentVariant } from '@deps/components/content/content';
import DistributionPieChartSmall from '@deps/components/dashboard/distribution-charts/distribution-pie-chart-small';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { StatGroupingResponse } from '@deps/helpers/dashboard/types';
import { formatNumberLabel, wholeNumberFormatify } from '@deps/helpers/numbers.helper';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import { ReactComponent as ChartSquare } from '@deps/styles/elements/icons/icons_outlined/chart-square-bar.svg';
import { ReactComponent as LighBulb } from '@deps/styles/elements/icons/icons_outlined/light-bulb.svg';

interface Props {
    caseStats: StatGroupingResponse;
    blockLabel: string;
    timeFrameLabel: string;
    classNames?: string;
    statMeasurementLabel: string;
    summaryBlockFormatter: (caseStats: StatGroupingResponse) => string;
    variant?: 'single' | 'double' | 'full';
    showViewMore?: boolean;
    filterParams?: { [key: string]: string | number | boolean };
}

const CaseStatBlock = ({
    caseStats,
    classNames,
    blockLabel,
    timeFrameLabel,
    statMeasurementLabel,
    summaryBlockFormatter,
    variant = 'single',
    showViewMore = false,
    filterParams = {},
}: Props) => {
    const renderLabel = () => {
        return (
            <div className="flex gap-1">
                <Label label={blockLabel} variant={LabelVariant.LabelMd} />
                <Label label={timeFrameLabel} variant={LabelVariant.LabelSmAlt} />
            </div>
        );
    };

    const renderStatValue = () => {
        return (
            <div className="flex gap-1">
                <Content details={wholeNumberFormatify(caseStats?.count || 0)} variant={ContentVariant.Value} />
                <Content details={formatNumberLabel(statMeasurementLabel, caseStats?.count || 0)} variant={ContentVariant.Value} />
            </div>
        );
    };

    const renderChart = () => {
        return <DistributionPieChartSmall statGrouping={caseStats} showInLegend={true} />;
    };

    const renderDummyText = () => {
        return (
            <>
                <Typography className="flex gap-2 items-center mb-2" variant={TypographyVariant.BodyBold}>
                    <LighBulb height={24} width={24} />
                    <span>Insight</span>
                </Typography>
                <Typography variant={TypographyVariant.BodySm}>{summaryBlockFormatter(caseStats)}</Typography>
                {showViewMore && (
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
                )}
            </>
        );
    };

    const renderSingleStatBlock = () => {
        return (
            <>
                {renderLabel()}
                {renderStatValue()}
                {renderChart()}
                {renderDummyText()}
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
                    {renderDummyText()}
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

    return (
        <CardContainer fullWidth={false} containerClassNames={clsx(classNames, getWidthClassName())}>
            {variant === 'single' && renderSingleStatBlock()}
            {variant === 'double' && renderDoubleStatBlock()}
        </CardContainer>
    );
};

export default CaseStatBlock;
