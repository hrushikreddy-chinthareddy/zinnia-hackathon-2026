import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { ReactComponent as DocumentReportIcon } from '@deps/styles/elements/icons/files/document-report.svg';

import PolicyTestCard from './policy-test-card/policy-test-card';
import PremiumCard, { PremiumCardProps } from './premium-card/premium-card';
interface MECCardProps {
    isMEC: boolean;
    mecTestDate?: string;
    guideline?: GuidelineProps;
    sevenYearCard?: PremiumCardProps;
}

interface GuidelineProps {
    compare: number;
    total: number;
}

const MECCard = ({ isMEC, mecTestDate, guideline, sevenYearCard = {} as PremiumCardProps }: MECCardProps) => {
    const { t } = useTranslation();
    const formattedTestDate = convertKebabedDateString(mecTestDate as string);

    const tooltipText = isMEC
        ? t('premium.mecCard.statusToolTipMecYes')
        : t('premium.mecCard.statusToolTipMecNo') + t('premium.mecCard.statusToolTipDate', { mecTestDate: formattedTestDate });

    const articleClasses = clsx('rounded-b bg-white p-4 md:p-6', 'lg:p-8');

    const guidelinesContainerClasses = clsx('mt-4', 'lg:pl-8');

    const sevenContainerClasses = clsx('mt-8', 'lg:pl-8');

    return (
        <article className={articleClasses}>
            <div className="flex items-center">
                <DocumentReportIcon width={24} height={24} className="mr-2 text-primary" />
                <Typography variant={TypographyVariant.H2}>{t('premium.mecCard.title')}</Typography>
            </div>
            <div className={guidelinesContainerClasses}>
                <PolicyTestCard
                    amountProps={{
                        label: t('premium.mecCard.guidelineTests.amountRemaining.label'),
                        tooltipBody: t('premium.mecCard.guidelineTests.amountRemaining.tooltipBody'),
                        tooltipTitle: t('premium.mecCard.guidelineTests.amountRemaining.label'),
                    }}
                    basisProps={{
                        label: t('premium.mecCard.guidelineTests.basis.label'),
                        tooltipBody: t('premium.mecCard.guidelineTests.basis.tooltipBody'),
                        tooltipTitle: t('premium.mecCard.guidelineTests.basis.label'),
                    }}
                    compareValue={guideline?.compare || 0}
                    title={t('premium.mecCard.guidelineTests.title')}
                    total={guideline?.total || 0}
                    totalProps={{
                        label: t('premium.mecCard.guidelineTests.total.label'),
                        tooltipBody: t('premium.mecCard.guidelineTests.total.tooltipBody'),
                        tooltipTitle: t('premium.mecCard.guidelineTests.total.label'),
                    }}
                />
            </div>
            <div className={sevenContainerClasses}>
                <div className="flex items-center">
                    <Typography className="ml-2 mr-4" variant={TypographyVariant.H3}>
                        {t('premium.mecCard.sevenYearTitle')}
                    </Typography>
                    <div className="flex">
                        <Tooltip placement={PopoverPlacement.TopRight} body={tooltipText}>
                            <Badge
                                rounded={true}
                                variant={isMEC ? BadgeVariant.Success : BadgeVariant.Error}
                                label={isMEC ? t('premium.mecCard.isMEC') : t('premium.mecCard.isNotMEC')}
                                className="rounded-full"
                            />
                        </Tooltip>
                    </div>
                </div>
                <PremiumCard {...sevenYearCard} classNames="w-full" />
            </div>
        </article>
    );
};

export default MECCard;
