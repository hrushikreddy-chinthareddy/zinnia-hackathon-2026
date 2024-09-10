import clsx from 'clsx';
import { useRef } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import DotContainer from '@deps/components/dot-container/dot-container';
import Label, { LabelVariant } from '@deps/components/label/label';
import ProgressBar from '@deps/components/progress-bar/progress-bar';
import InactivePremiumCard, { InactivePremiumCardProps } from '@deps/containers/inactive-premium-card/inactive-premium-card';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString, parseAndFormatDate } from '@deps/helpers/string.helper';
import { PremiumCardTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as RewardsIcon } from '@deps/styles/elements/icons/navigation/rewards-portal.svg';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

export interface InactivePremiumCardTextsProps extends InactivePremiumCardProps {
    startText?: string;
    endText?: string;
}

export interface PremiumCardProps {
    title: string;
    cardLabel: string;
    cardLabelTooltip?: string;
    compareValue: number;
    total: number;
    progressBarLabel: string;
    progressBarLabelPopover?: string;
    classNames?: string;
    inactiveCardInfo?: InactivePremiumCardTextsProps;
}

const PremiumCard = ({
    title,
    cardLabel,
    cardLabelTooltip = '',
    compareValue,
    total,
    progressBarLabel,
    progressBarLabelPopover = '',
    classNames,
    inactiveCardInfo = { header: '' },
}: PremiumCardProps) => {
    const formattedRemainingAmt = numberFormatify(total - compareValue);

    const dotPopover = <Label variant={LabelVariant.LabelSm} label={cardLabel} tooltipTitle={cardLabelTooltip} />;

    const dotRight = <Label variant={LabelVariant.LabelMdAlt} label={formattedRemainingAmt} />;

    const ref = useRef<HTMLDivElement>(null);

    // if there is an inactive card, render that instead
    // Hiding until requirements for activating this state
    if (inactiveCardInfo && inactiveCardInfo.date) {
        const endDate = convertKebabedDateString(inactiveCardInfo.date);

        if (new Date() > new Date(endDate)) {
            const textValue = (
                <>
                    <Content variant={ContentVariant.BodySm} details={inactiveCardInfo.startText || ''} contentClassName="inline" />
                    <Content
                        variant={ContentVariant.BodySmBold}
                        details={parseAndFormatDate(NUMERIC_DATE_FORMAT, 'MMM. DD, YYYY', endDate) as string}
                        contentClassName="inline"
                    />
                    <Content variant={ContentVariant.BodySm} details={inactiveCardInfo.endText || ''} contentClassName="inline" />
                </>
            );
            return <InactivePremiumCard {...inactiveCardInfo} text={textValue} />;
        }
    }

    const classes = clsx('rounded border-2 border-gray-100', classNames);

    return (
        <article className={classes} data-testid={PremiumCardTest.PREMIUMCARD}>
            <div className="p-4">
                <div className="mb-6 flex">
                    <RewardsIcon width={24} height={24} />
                    <Label variant={LabelVariant.LabelLg} sentenceCase={false} className="ml-2" label={title} />
                </div>
                <ProgressBar compareValue={compareValue} total={total} label={progressBarLabel} labelPopover={progressBarLabelPopover} />
            </div>
            <div
                className="flex flex-col items-center justify-between bg-gray-50 p-4 sm:flex-row"
                data-testid={PremiumCardTest.FOOTER}
                ref={ref}
            >
                <DotContainer
                    dotLeftSide={dotPopover}
                    dotContainerClassName="w-full"
                    dotClassName="mx-1"
                    dotLeftSideClassName="self-center mt-1"
                    dotRightSide={dotRight}
                />
            </div>
        </article>
    );
};

export default PremiumCard;
