import { useQuery } from '@tanstack/react-query';
import { TFunction, useTranslation } from 'next-i18next';

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

const Field = ({
    labelKey,
    tooltipKey,
    value,
    formatAsCurrency = false,
    currencyFormat,
    t,
}: {
    labelKey: string;
    tooltipKey: string;
    value: string | number;
    formatAsCurrency: boolean;
    currencyFormat: Intl.NumberFormatOptions;
    t: TFunction;
}) => {
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
            <Content details={formattedValue} variant={ContentVariant.Value} />
        </div>
    );
};

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

    const qualificationTypeValue = tRaw(`enums.${qualificationType}`);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>
                {t('financials')}
            </Typography>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                {policy?.isAnnuity && (
                    <>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            <Field
                                labelKey="surrenderValue"
                                tooltipKey="netSurrenderValueTooltip"
                                value={surrenderValue as number}
                                formatAsCurrency={true}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                            <Field
                                labelKey="costBasis"
                                tooltipKey="costBasisTooltip"
                                value={costBasis as number}
                                formatAsCurrency={true}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                        </div>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            <Field
                                labelKey="qualificationType"
                                tooltipKey="qualificationTypeTooltip"
                                value={qualificationTypeValue}
                                formatAsCurrency={false}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                            <Field
                                labelKey="deathBenefit"
                                tooltipKey="baseDeathBenefitTooltip"
                                value={baseDeathBenefit as number}
                                formatAsCurrency={true}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                        </div>
                    </>
                )}
                {!policy?.isTerm && !policy.isAnnuity && (
                    <>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            <Field
                                labelKey="baseDeathBenefit"
                                tooltipKey="baseDeathBenefitTooltip"
                                value={baseDeathBenefit as number}
                                formatAsCurrency={true}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                            <Field
                                labelKey="accountValue"
                                tooltipKey="accountValueTooltip"
                                value={accountValue as number}
                                formatAsCurrency={true}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                        </div>
                        <div className="flex flex-col gap-8 lg:flex-row">
                            <Field
                                labelKey="netSurrenderValue"
                                tooltipKey="netSurrenderValueTooltip"
                                value={surrenderValue as number}
                                formatAsCurrency={true}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                            <Field
                                labelKey="costBasis"
                                tooltipKey="costBasisTooltip"
                                value={costBasis as number}
                                formatAsCurrency={true}
                                currencyFormat={currencyFormat}
                                t={t}
                            />
                        </div>
                    </>
                )}
                {policy?.isTerm && (
                    <div className="flex flex-col gap-8 lg:flex-row">
                        <Field
                            labelKey="baseDeathBenefit"
                            tooltipKey="baseDeathBenefitTooltip"
                            value={baseDeathBenefit as number}
                            formatAsCurrency={true}
                            currencyFormat={currencyFormat}
                            t={t}
                        />
                        <Field
                            labelKey="policyTerm"
                            tooltipKey="policyTermTooltip"
                            value={translateYearOrYears(fixedCostPeriod, tRaw)}
                            formatAsCurrency={false}
                            currencyFormat={currencyFormat}
                            t={t}
                        />
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
