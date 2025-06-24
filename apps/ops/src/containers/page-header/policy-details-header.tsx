import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageHeader from '@deps/components/page-header/page-header';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';

import TransactionCard from '../policy-details/cards/transaction-card';
import { buildTransactionCards } from '../policy-details/policy-details.helpers';

export const PolicyDetailsHeader = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.policyDetails',
    });
    const currencyFormat: Intl.NumberFormatOptions = { currency: policy.currency ?? 'USD', style: 'currency' };
    const { accountValue, costBasis, faceValue, surrenderValue } = policy;
    const transactionCards = buildTransactionCards(policy, t);

    const title = t(`${policy.isAnnuity ? 'contractDetails' : 'policyDetails'}`);

    const belowHeaderTextChildren = (
        <>
            <div className="mt-4 sm:flex gap-8 sm:flex-wrap grid grid-cols-2">
                <div>
                    <Label
                        label={t(`baseDeathBenefit`)}
                        tooltipBody={t(`baseDeathBenefitTooltip`)}
                        tooltipTitle={t(`baseDeathBenefit`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={numberFormatify(faceValue as number, currencyFormat)} variant={ContentVariant.Value} />
                </div>
                <div>
                    <Label
                        label={t(`accountValue`)}
                        tooltipBody={t(`accountValueTooltip`)}
                        tooltipTitle={t(`accountValue`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={numberFormatify(accountValue as number, currencyFormat)} variant={ContentVariant.Value} />
                </div>
                <div>
                    <Label
                        label={t(`netSurrenderValue`)}
                        tooltipBody={t(`netSurrenderValueTooltip`)}
                        tooltipTitle={t(`netSurrenderValue`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={numberFormatify(surrenderValue as number, currencyFormat)} variant={ContentVariant.Value} />
                </div>
                <div>
                    <Label
                        label={t(`costBasis`)}
                        tooltipBody={t(`costBasisTooltip`)}
                        tooltipTitle={t(`costBasis`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={numberFormatify(costBasis as number, currencyFormat)} variant={ContentVariant.Value} />
                </div>
            </div>
            <div className="mt-4 flex gap-4 flex-wrap" data-testid="transaction-cards">
                {transactionCards.map(transactionCardProps => (
                    <TransactionCard key={transactionCardProps.cardTitle} {...transactionCardProps} />
                ))}
            </div>
        </>
    );

    return <PageHeader headerText={title} belowHeaderTextChildren={belowHeaderTextChildren} />;
};

export default PolicyDetailsHeader;
