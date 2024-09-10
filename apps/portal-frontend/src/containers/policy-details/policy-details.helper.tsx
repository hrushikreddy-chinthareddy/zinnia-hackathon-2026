import { TFunction } from 'next-i18next';

import { PolicyDetailsHeaderData, PolicyDetailsMetaData } from '@deps/containers/page-header/policy-details-header';
import { PolicyTimelineCardData } from '@deps/containers/policy-details/cards/policy-timeline-card';
import { ProductDetailsCardData } from '@deps/containers/policy-details/cards/product-details-card';
import { SalesChannelCardData } from '@deps/containers/policy-details/cards/sales-channel-card';
import { TransactionCardProps } from '@deps/containers/policy-details/cards/transaction-card';
import { InsuredCardData } from '@deps/containers/shared-cards/insured/insured-card.helper';
import { getDisplayAge, calculateAgeNumber } from '@deps/helpers/age.helper';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { getFullName, getRiskClass } from '@deps/helpers/party-info-helper';
import { getStateName } from '@deps/helpers/states.helper';
import { convertKebabedDateString, isNullEmptyOrUndefined, translateYearOrYears } from '@deps/helpers/string.helper';
import { CoverageParticipants, DistributionType, PartyRole, Policy, PolicyCoverage } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface PolicyDetailsPageData {
    meta: PolicyDetailsMetaData;
    insured: InsuredCardData;
    policyDetails: PolicyDetailsHeaderData;
    policyTimeline: PolicyTimelineCardData;
    productDetails: ProductDetailsCardData;
    salesChannel: SalesChannelCardData;
}

export const BASE_KEYS = {
    insured: 'policy.detailCards.insured.',
    policyDetails: 'policy.detailCards.policyDetails.',
    policyTimeline: 'policy.detailCards.policyTimeline.',
    productDetails: 'policy.detailCards.productDetails.',
    salesChannel: 'policy.detailCards.salesChannel.',
};

const distributionMapping: { [key: DistributionType | string]: string } = {
    [DistributionType.AFFILIATEDAGENCY]: 'policy.distributionType.affiliatedAgency',
    [DistributionType.BANKMARKET]: 'policy.distributionType.bankMarket',
    [DistributionType.BROKERDEALER]: 'policy.distributionType.brokerDealer',
    [DistributionType.BROKERAGEINDEPENDENTMARKET]: 'policy.distributionType.brokerageIndependentMarket',
    [DistributionType.CAPTIVEMARKET]: 'policy.distributionType.captiveMarket',
    [DistributionType.FINANCIALINSTITUTION]: 'policy.distributionType.financialInstitution',
    [DistributionType.FINANCIALPLANNINGFIRM]: 'policy.distributionType.financialPlanningFirm',
    [DistributionType.INDEPENDENTAGENCY]: 'policy.distributionType.independentAgency',
    [DistributionType.INSTITUTIONALMARKET]: 'policy.distributionType.institutionalMarket',
    [DistributionType.REGISTEREDINVESTMENTADVISER]: 'policy.distributionType.registeredInvestmentAdviser',
    [DistributionType.THIRDPARTYDIRECTTOCONSUMER]: `policy.distributionType.thirdPartyDirectToConsumer`,
    [DistributionType.WIREHOUSE]: 'policy.distributionType.wirehouse',
};

export const mapDistribution = (distribution: DistributionType | string = DEFAULT_ERROR_STRING, t: TFunction): string => {
    return distributionMapping[distribution] ? t(distributionMapping[distribution]) : distribution;
};

// grabs any and all coverage participants from all coverage layers, and puts them into an array
const listCoverageParticipants = (coverage: PolicyCoverage | undefined): CoverageParticipants[] => {
    const coverageParticipants: CoverageParticipants[] = [];
    coverage?.coverageLayers?.forEach(layer => {
        coverageParticipants.push(...(layer.coverageParticipants || []));
    });
    return coverageParticipants;
};

export const getInsuredParty = ({ coverage, parties = [], partyRoles = [] }: Policy) => {
    const insuredPartyFromRoles = partyRoles.find(party => party.partyRole === PartyRole.INSURED);
    if (!insuredPartyFromRoles) {
        return {};
    }

    const coveredParty = listCoverageParticipants(coverage).find(coveredParty => coveredParty.partyId === insuredPartyFromRoles.partyId);

    if (!coveredParty) {
        return {};
    }

    const insuredParty = parties.find(party => party.partyId === insuredPartyFromRoles.partyId);

    if (!insuredParty) {
        return {};
    }

    return {
        ageAtIssue: coveredParty.issueAge,
        currentAge: calculateAgeNumber(insuredParty.dateOfBirth),
        fullName: getFullName(insuredParty),
        partyId: insuredParty.partyId,
        riskClass: coveredParty.riskClass,
    };
};

export const buildInsuredData = (policy: Policy, t: TFunction): InsuredCardData => {
    const insuredParty = getInsuredParty(policy);
    const { ageAtIssue, currentAge, fullName, partyId, riskClass } = insuredParty;

    return {
        ageAtIssue: getDisplayAge(ageAtIssue, t(`${BASE_KEYS.insured}oneYearOld`), t(`${BASE_KEYS.insured}nYearsOld`, { n: ageAtIssue })),
        currentAge: getDisplayAge(currentAge, t(`${BASE_KEYS.insured}oneYearOld`), t(`${BASE_KEYS.insured}nYearsOld`, { n: currentAge })),
        fullName: {
            href: `/policies/${policy.product?.planCode}/${policy.policyNumber}/people/${partyId}`,
            text: fullName || DEFAULT_ERROR_STRING,
        },
        riskClass: riskClass ? (getRiskClass(riskClass, t) as string) : DEFAULT_ERROR_STRING,
    };
};

export const buildTransactionCards = (
    policyDetailsData: PolicyDetailsHeaderData,
    { currency, planCode, policyNumber }: PolicyDetailsMetaData,
    t: TFunction
): TransactionCardProps[] => {
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };
    const premiumsCard = {
        cardTitle: t(`${BASE_KEYS.policyDetails}premiums`),
        fieldLabel: t(`${BASE_KEYS.policyDetails}allTimePremium`),
        href: `/policies/${planCode}/${policyNumber}/transactions/premiums`,
        summary: `${t(`${BASE_KEYS.policyDetails}ytd`)} ${numberFormatify(policyDetailsData.premiumsYtd as number, currencyFormat)}`,
        value: numberFormatify(policyDetailsData.premiums as number, currencyFormat),
    };
    const withdrawalsCard = {
        cardTitle: t(`${BASE_KEYS.policyDetails}withdrawals`),
        fieldLabel: t(`${BASE_KEYS.policyDetails}withdrawalsTaken`),
        href: `/policies/${planCode}/${policyNumber}/transactions/withdrawals`,
        summary: `${t(`${BASE_KEYS.policyDetails}total`)} ${numberFormatify(
            policyDetailsData.withdrawalTotalAmount as number,
            currencyFormat
        )}`,
        value: policyDetailsData.withdrawalsTaken || 0,
    };
    const loansCard = {
        cardTitle: t(`${BASE_KEYS.policyDetails}loans`),
        fieldLabel: t(`${BASE_KEYS.policyDetails}loansTaken`),
        href: `/policies/${planCode}/${policyNumber}/transactions/loans`,
        summary: `${t(`${BASE_KEYS.policyDetails}total`)} ${numberFormatify(policyDetailsData.loansTotalAmount as number, currencyFormat)}`,
        value: Number(policyDetailsData.loansTaken),
    };
    const fundsCard = {
        cardTitle: t(`${BASE_KEYS.policyDetails}funds`),
        fieldLabel: t(`${BASE_KEYS.policyDetails}totalFundValue`),
        href: `/policies/${planCode}/${policyNumber}/policy/funds`,
        summary: `${t(`${BASE_KEYS.policyDetails}lastDeposit`)} ${numberFormatify(
            policyDetailsData.lastDeposit as number,
            currencyFormat
        )}`,
        value: numberFormatify(policyDetailsData.fundValue as number, currencyFormat),
    };
    return [premiumsCard, withdrawalsCard, loansCard, fundsCard];
};

const mapPolicyTimelineValues = (policy: Policy, t: TFunction): PolicyTimelineCardData => {
    const { policyTerm, policyYear, policyDates } = policy;
    const { maturityDate, issueDate } = policyDates ?? {};

    const policyLength = !policyTerm
        ? !maturityDate
            ? t('policy.detailCards.policyTimeline.lifetime')
            : DEFAULT_ERROR_STRING
        : translateYearOrYears(policyTerm, t);

    const policyYearsLeft =
        !isNullEmptyOrUndefined(policyTerm as number) &&
        !isNullEmptyOrUndefined(policyYear as number) &&
        !isNullEmptyOrUndefined(maturityDate)
            ? t('temporal.timeLeft', { timespan: translateYearOrYears((policyTerm as number) - Number(policyYear), t) })
            : null;

    return {
        issueDate: convertKebabedDateString(issueDate),
        maturityDate: maturityDate ? convertKebabedDateString(maturityDate) : null,
        policyAge: translateYearOrYears(policyYear, t),
        policyLength,
        policyYearsLeft,
    };
};

export const mapPolicyDetails = (policy: Policy, t: TFunction): PolicyDetailsPageData => {
    return {
        salesChannel: {
            issueState: getStateName(policy?.issueState) ?? DEFAULT_ERROR_STRING,
            salesChannel: mapDistribution(policy?.product?.distribution, t),
        },
        insured: buildInsuredData(policy, t),
        meta: {
            currency: policy?.currency,
            planCode: policy?.product?.planCode,
            policyNumber: policy?.policyNumber,
        },
        policyDetails: {
            accountValue: policy?.accountValues?.endingAccountValue,
            costBasis: policy?.costBasis?.costBasis,
            faceValue: policy?.coverage?.totalCoverageAmount,
            fundValue: policy?.allocation?.funds?.[0]?.totalFundValue,
            lastDeposit: policy?.allocation?.funds?.[0]?.fundSegments?.[0]?.depositAmount,
            loansTaken: policy?.loanValues?.totalNumberOfLoan,
            loansTotalAmount: policy?.loanValues?.totalLoanBalance,
            netSurrenderValue: policy?.accountValues?.surrenderValue,
            premiums: policy?.accountValues?.cumulativePremiumSinceIssue,
            premiumsYtd: policy?.accountValues?.totalYearToDatePremiumAmount,
            withdrawalsTaken: policy?.withdrawalValues?.numberOfWithdrawal,
            withdrawalTotalAmount: policy?.withdrawalValues?.totalWithdrawalAmount,
        },
        policyTimeline: mapPolicyTimelineValues(policy, t),
        productDetails: {
            carrierId: policy?.carrierId,
            glProductCode: policy?.product?.generalLedgerPlanCode,
            planCode: policy?.product?.planCode,
            productMarketingName: policy?.product?.marketingName,
            productName: policy?.product?.planName,
            productType: policy?.product?.productType,
        },
    };
};
