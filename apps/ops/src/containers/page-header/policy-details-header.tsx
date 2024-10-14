import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageHeader from '@deps/components/page-header/page-header';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

import TransactionCard from '../policy-details/cards/transaction-card';
import { buildTransactionCards } from '../policy-details/policy-details.helper';

export const PolicyDetailsHeader = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.policyDetails',
    });
    const { breadcrumb } = useBreadcrumb();
    const currencyFormat: Intl.NumberFormatOptions = { currency: policy.currency ?? 'USD', style: 'currency' };
    const { accountValue, costBasis, faceValue, surrenderValue } = policy;
    const transactionCards = buildTransactionCards(policy, t);

    const title = t(`${policy.isAnnuity ? 'contractDetails' : 'policyDetails'}`);

    const belowHeaderTextChildren = (
        <>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                <div className="flex flex-col gap-8 lg:flex-row">
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
                </div>
                <div className="flex flex-col gap-8 lg:flex-row">
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
            </div>
            <div className="mt-6 flex flex-col gap-6 md:flex-row md:flex-wrap" data-testid="transaction-cards">
                {transactionCards.map(transactionCardProps => (
                    <TransactionCard key={transactionCardProps.cardTitle} {...transactionCardProps} />
                ))}
            </div>
        </>
    );

    return (
        <PageHeader
            headerText={title}
            breadcrumbText={breadcrumb?.text}
            breadcrumbUrl={breadcrumb?.url}
            belowHeaderTextChildren={belowHeaderTextChildren}
        />
    );
};

export default PolicyDetailsHeader;
