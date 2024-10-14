import { TFunction, useTranslation } from 'next-i18next';

import { BadgeVariant } from '@deps/components/badge/badge.helper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import PolicyTestCard from '@deps/containers/mec-card/policy-test-card/policy-test-card';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { TestValues } from '@deps/models/policy/sor-policy';
import { ReactComponent as DateIcon } from '@deps/styles/elements/icons/content/date.svg';

interface InactiveCardProps {
    sevenPayPeriod?: string;
    t: TFunction;
}
interface SevenPayCardProps {
    testValues?: TestValues;
}

const getValues = (testValues: TestValues | undefined, t: TFunction) => {
    const isMec = testValues?.modifiedEndowmentContract?.modifiedEndowmentContractStatus;

    if (isMec) {
        return {
            amountProps: {
                label: t('amountExcessMec'),
                tooltipBody: t('amountExcessMecTooltip'),
                tooltipTitle: t('amountExcessMec'),
            },
            badgeProps: {
                label: t('isMec'),
                tooltipBody: t('isMecTooltip'),
                variant: BadgeVariant.Error,
            },
            basisProps: {
                label: t('basis'),
                tooltipBody: t('basisTooltip'),
                tooltipTitle: t('basis'),
            },
            mecClass:
                Number(testValues.modifiedEndowmentContract?.sevenPayTestBasis) >
                Number(testValues.modifiedEndowmentContract?.sevenPayLimit)
                    ? 'mec-over'
                    : 'mec-even',
            totalProps: {
                label: t('totalLimit'),
                tooltipBody: t('totalLimitTooltip'),
                tooltipTitle: t('totalLimit'),
            },
        };
    } else {
        return {
            amountProps: {
                label: t('amountRemaining'),
                tooltipBody: t('amountRemainingTooltip'),
                tooltipTitle: t('amountRemaining'),
            },
            badgeProps: {
                label: t('isNotMec'),
                tooltipBody: t('isNotMecTooltip', {
                    mecTestDate: convertKebabedDateString(testValues?.modifiedEndowmentContract?.modifiedEndowmentContractTestDate ?? ''),
                }),
                variant: BadgeVariant.Success,
            },
            basisProps: {
                label: t('basis'),
                tooltipBody: t('basisTooltip'),
                tooltipTitle: t('basis'),
            },
            fieldDataValues: [
                {
                    caption: t('testPeriodCaption', { year: testValues?.modifiedEndowmentContract?.yearInPeriod }),
                    label: t('testPeriod'),
                    tooltipBody: t('testPeriodTooltip'),
                    tooltipTitle: t('testPeriod'),
                    value: `${convertKebabedDateString(
                        testValues?.modifiedEndowmentContract?.sevenPayStartDate ?? ''
                    )} - ${convertKebabedDateString(testValues?.modifiedEndowmentContract?.sevenPayPeriod ?? '')}`,
                },
                {
                    label: t('annualPremium'),
                    tooltipBody: t('annualPremiumTooltip'),
                    tooltipTitle: t('annualPremium'),
                    value: numberFormatify(testValues?.modifiedEndowmentContract?.sevenPayPremium),
                },
            ],
            mecClass: 'not-mec',
            totalProps: {
                label: t('totalLimit'),
                tooltipBody: t('totalLimitTooltip'),
                tooltipTitle: t('totalLimit'),
            },
        };
    }
};

const InactiveCard = ({ sevenPayPeriod, t }: InactiveCardProps) => {
    return (
        <div className="responsive-padding flex flex-col gap-6 rounded border-2 border-dashed border-gray-100 bg-gray-50 text-gray-900">
            <div className="responsive-padding flex flex-col items-center gap-1 text-center">
                <DateIcon className="text-gray-300" height={50} width={50} />
                <Typography variant={TypographyVariant.H3}>{t('inactiveTitle')}</Typography>
                <p className="font-secondary text-base font-normal">
                    {t('inactiveStartText')}
                    <span className="font-bold">{convertKebabedDateString(sevenPayPeriod)}</span>
                    {t('inactiveEndText')}
                </p>
            </div>
        </div>
    );
};

const SevenPayCard = ({ testValues }: SevenPayCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'premium.policyTestsCard.sevenPay' });

    const { amountProps, badgeProps, basisProps, fieldDataValues, mecClass, totalProps } = getValues(testValues, t);

    if (new Date() > new Date(testValues?.modifiedEndowmentContract?.sevenPayPeriod ?? '')) {
        return <InactiveCard sevenPayPeriod={testValues?.modifiedEndowmentContract?.sevenPayPeriod} t={t} />;
    }

    return (
        <PolicyTestCard
            amountProps={amountProps}
            badgeProps={badgeProps}
            basisProps={basisProps}
            classNames={mecClass}
            compareValue={testValues?.modifiedEndowmentContract?.sevenPayTestBasis}
            fieldDataValues={fieldDataValues}
            title={t('title')}
            total={testValues?.modifiedEndowmentContract?.sevenPayLimit}
            totalProps={totalProps}
        />
    );
};

export default SevenPayCard;
