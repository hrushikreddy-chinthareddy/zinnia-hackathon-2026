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

import TransactionCard from './transaction-card';
import CardContainer from '../../card-container/card-container';
import { buildTransactionCards } from '../policy-details.helpers';

export const PolicyFinancialsCard = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.policyDetails',
    });
    const currencyFormat: Intl.NumberFormatOptions = {
        currency: policy.currency ?? 'USD',
        style: 'currency',
    };

    const { accountValue, costBasis, baseDeathBenefit, surrenderValue } =
        policy;

    const { data: transactionCards } = useQuery({
        queryKey: ['policyVisibility', policy],
        queryFn: () => getPolicyVisibility(policy),
        select: (visibility) => buildTransactionCards(policy, t, visibility),
    });

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-200">
            <Typography variant={TypographyVariant.H2}>
                {t('financials')}
            </Typography>
            <div className="mt-4 sm:flex gap-8 sm:flex-wrap grid grid-cols-2">
                <div>
                    <Label
                        label={t(`baseDeathBenefit`)}
                        tooltipBody={t(`baseDeathBenefitTooltip`)}
                        tooltipTitle={t(`baseDeathBenefit`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={numberFormatify(
                            baseDeathBenefit as number,
                            currencyFormat
                        )}
                        variant={ContentVariant.Value}
                    />
                </div>
                <div>
                    <Label
                        label={t(`accountValue`)}
                        tooltipBody={t(`accountValueTooltip`)}
                        tooltipTitle={t(`accountValue`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={numberFormatify(
                            accountValue as number,
                            currencyFormat
                        )}
                        variant={ContentVariant.Value}
                    />
                </div>
                <div>
                    <Label
                        label={t(`netSurrenderValue`)}
                        tooltipBody={t(`netSurrenderValueTooltip`)}
                        tooltipTitle={t(`netSurrenderValue`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={numberFormatify(
                            surrenderValue as number,
                            currencyFormat
                        )}
                        variant={ContentVariant.Value}
                    />
                </div>
                <div>
                    <Label
                        label={t(`costBasis`)}
                        tooltipBody={t(`costBasisTooltip`)}
                        tooltipTitle={t(`costBasis`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content
                        details={numberFormatify(
                            costBasis as number,
                            currencyFormat
                        )}
                        variant={ContentVariant.Value}
                    />
                </div>
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
