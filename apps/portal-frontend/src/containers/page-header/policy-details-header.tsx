import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageHeader from '@deps/components/page-header/page-header';
import { numberFormatify } from '@deps/helpers/numbers.helper';

import TransactionCard from '../policy-details/cards/transaction-card';
import { buildTransactionCards } from '../policy-details/policy-details.helper';

export interface PolicyDetailsHeaderData {
    accountValue?: number;
    costBasis?: number;
    faceValue?: number;
    fundValue?: number;
    lastDeposit?: number;
    loansTaken?: number;
    loansTotalAmount?: number;
    netSurrenderValue?: number;
    premiums?: number;
    premiumsYtd?: number;
    withdrawalsTaken?: number;
    withdrawalTotalAmount?: number;
}

export interface PolicyDetailsMetaData {
    currency?: string;
    policyNumber?: string;
    [key: string]: any;
}

interface PolicyDetailsHeaderProps {
    policyDetailsHeaderData: PolicyDetailsHeaderData;
    meta: PolicyDetailsMetaData;
    breadcrumbText?: string;
    breadcrumbUrl?: string;
}
const BASE_KEY = 'policy.detailCards.policyDetails.';

export const PolicyDetailsHeader = ({ meta, policyDetailsHeaderData, breadcrumbText, breadcrumbUrl }: PolicyDetailsHeaderProps) => {
    const { t } = useTranslation();
    const currencyFormat: Intl.NumberFormatOptions = { currency: meta.currency ?? 'USD', style: 'currency' };
    const { accountValue, costBasis, faceValue, netSurrenderValue } = policyDetailsHeaderData;
    const transactionCards = buildTransactionCards(policyDetailsHeaderData, meta, t);

    const title = t(`${BASE_KEY}policyDetails`);

    const belowHeaderTextChildren = (
        <>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row">
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div>
                        <Label
                            label={t(`${BASE_KEY}baseDeathBenefit`)}
                            tooltipBody={t(`${BASE_KEY}baseDeathBenefitTooltip`)}
                            tooltipTitle={t(`${BASE_KEY}baseDeathBenefit`)}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={numberFormatify(faceValue as number, currencyFormat)} variant={ContentVariant.Value} />
                    </div>
                    <div>
                        <Label
                            label={t(`${BASE_KEY}accountValue`)}
                            tooltipBody={t(`${BASE_KEY}accountValueTooltip`)}
                            tooltipTitle={t(`${BASE_KEY}accountValue`)}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={numberFormatify(accountValue as number, currencyFormat)} variant={ContentVariant.Value} />
                    </div>
                </div>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div>
                        <Label
                            label={t(`${BASE_KEY}netSurrenderValue`)}
                            tooltipBody={t(`${BASE_KEY}netSurrenderValueTooltip`)}
                            tooltipTitle={t(`${BASE_KEY}netSurrenderValue`)}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={numberFormatify(netSurrenderValue as number, currencyFormat)} variant={ContentVariant.Value} />
                    </div>
                    <div>
                        <Label
                            label={t(`${BASE_KEY}costBasis`)}
                            tooltipBody={t(`${BASE_KEY}costBasisTooltip`)}
                            tooltipTitle={t(`${BASE_KEY}costBasis`)}
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
            breadcrumbText={breadcrumbText}
            breadcrumbUrl={breadcrumbUrl}
            belowHeaderTextChildren={belowHeaderTextChildren}
        />
    );
};

export default PolicyDetailsHeader;
