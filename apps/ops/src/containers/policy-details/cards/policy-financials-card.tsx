import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { getPolicyVisibility } from '@deps/helpers/policy-visibility/policy-visibility-helper';
import { translateYearOrYears } from '@deps/helpers/string.helpers';

import TransactionCard from './transaction-card';
import CardContainer from '../../card-container/card-container';
import { buildTransactionCards } from '../policy-details.helpers';

export const PolicyFinancialsCard = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.policyDetails',
    });
    const { t: tRaw } = useTranslation();

    const currencyFormat: Intl.NumberFormatOptions = {
        currency: policy.currency ?? 'USD',
        style: 'currency',
    };

    const {
        accountValue,
        costBasis,
        baseDeathBenefit,
        surrenderValue,
        qualificationType,
        fixedCostPeriod,
    } = policy;

    const { data: transactionCards } = useQuery({
        queryKey: ['policyVisibility', policy],
        queryFn: () => getPolicyVisibility(policy),
        select: (visibility) => buildTransactionCards(policy, t, visibility),
    });

    const qualificationTypeValue = tRaw(
        `dashboard.search.results.policySummaryCard.${qualificationType?.toLocaleLowerCase()}`
    );

    const renderField = (
        labelKey: string,
        tooltipKey: string,
        value: string | number,
        formatAsCurrency = false
    ) => {
        const formattedValue = formatAsCurrency
            ? numberFormatify(value, currencyFormat)
            : String(value);

        return (
            <div>
                <Label
                    label={t(labelKey)}
                    tooltipTitle={t(labelKey)}
                    tooltipBody={t(tooltipKey)}
                    variant={LabelVariant.FieldLabel}
                />
                <Content
                    details={formattedValue}
                    variant={ContentVariant.Value}
                />
            </div>
        );
    };

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>
                {t('financials')}
            </Typography>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                {policy?.isAnnuity && (
                    <>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            {renderField(
                                'surrenderValue',
                                'netSurrenderValueTooltip',
                                surrenderValue as number,
                                true
                            )}
                            {renderField(
                                'costBasis',
                                'costBasisTooltip',
                                costBasis as number,
                                true
                            )}
                        </div>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            {renderField(
                                'qualificationType',
                                'qualificationTypeTooltip',
                                qualificationTypeValue
                            )}
                            {renderField(
                                'deathBenefit',
                                'baseDeathBenefitTooltip',
                                baseDeathBenefit as number,
                                true
                            )}
                        </div>
                    </>
                )}
                {!policy?.isTerm && !policy.isAnnuity && (
                    <>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            {renderField(
                                'baseDeathBenefit',
                                'baseDeathBenefitTooltip',
                                baseDeathBenefit as number,
                                true
                            )}
                            {renderField(
                                'accountValue',
                                'accountValueTooltip',
                                accountValue as number,
                                true
                            )}
                        </div>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            {renderField(
                                'netSurrenderValue',
                                'netSurrenderValueTooltip',
                                surrenderValue as number,
                                true
                            )}
                            {renderField(
                                'costBasis',
                                'costBasisTooltip',
                                costBasis as number,
                                true
                            )}
                        </div>
                    </>
                )}
                {policy?.isTerm && (
                    <div className="flex flex-col gap-8 lg:flex-row">
                        {renderField(
                            'baseDeathBenefit',
                            'baseDeathBenefitTooltip',
                            baseDeathBenefit as number,
                            true
                        )}
                        {renderField(
                            'policyTerm',
                            'policyTermTooltip',
                            translateYearOrYears(fixedCostPeriod, tRaw),
                            false
                        )}
                    </div>
                )}
            </div>
            <div
                className="mt-4 flex gap-4 flex-wrap"
                data-testid="transaction-cards"
            >
                {(transactionCards ?? []).map((transactionCardProps) => (
                    <TransactionCard
                        key={transactionCardProps.cardTitle}
                        {...transactionCardProps}
                    />
                ))}
            </div>
        </CardContainer>
    );
};
