import { DistributionType, FeatureType } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { ApplicationDetailsCardData } from '@deps/containers/policy-details/cards/application-details/annuity-application-details-card.tsx';
import { PolicyTimelineCardData } from '@deps/containers/policy-details/cards/timeline-card';
import { TransactionCardProps } from '@deps/containers/policy-details/cards/transaction-card';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getStateName } from '@deps/helpers/states.helpers';
import { convertKebabedDateString, isNullEmptyOrUndefined, translateYearOrYears } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

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

export const buildTransactionCards = (policy: PolicyDetails, t: TFunction): TransactionCardProps[] => {
    const { policyNumber, planCode, currency, isAnnuity } = policy;
    // BPB - TODO: add these to PolicyDetails
    const { accountValues, withdrawalValues, loanValues, allocation } = policy.policy;
    const cumulativePremiumSinceIssue = accountValues?.cumulativePremiumSinceIssue;
    const fundValue = allocation?.funds?.[0]?.totalFundValue;
    const lastDeposit = allocation?.funds?.[0]?.fundSegments?.[0]?.depositAmount;
    const loansAmount = loanValues?.totalLoanBalance;
    const loansCount = loanValues?.totalNumberOfLoan;
    const withdrawalAmount = withdrawalValues?.totalWithdrawalAmount;
    const withdrawalCount = withdrawalValues?.numberOfWithdrawal;
    const ytdPremiums = accountValues?.totalYearToDatePremiumAmount;

    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };

    const premiumsCard = {
        cardTitle: t('premiums'),
        fieldLabel: t('allTimePremium'),
        href: `/policies/${planCode}/${policyNumber}/policy/premiums`,
        summary: `${t('ytd')} ${numberFormatify(ytdPremiums as number, currencyFormat)}`,
        value: numberFormatify(cumulativePremiumSinceIssue as number, currencyFormat),
    };

    const withdrawalsCard = {
        cardTitle: t('withdrawals'),
        fieldLabel: t('withdrawalsTaken'),
        href: `/policies/${planCode}/${policyNumber}/policy/withdrawals`,
        summary: `${t('total')} ${numberFormatify(withdrawalAmount as number, currencyFormat)}`,
        value: withdrawalCount || 0,
    };

    const loansCard = {
        cardTitle: t('loans'),
        fieldLabel: t('loansTaken'),
        href: `/policies/${planCode}/${policyNumber}/policy/loans`,
        summary: `${t('total')} ${numberFormatify(loansAmount as number, currencyFormat)}`,
        value: Number(loansCount),
    };

    const fundsCard = {
        cardTitle: t('funds'),
        fieldLabel: t('totalFundValue'),
        href: `/policies/${planCode}/${policyNumber}/policy/funds`,
        summary: `${t('lastDeposit')} ${numberFormatify(lastDeposit as number, currencyFormat)}`,
        value: !isAnnuity ? numberFormatify(fundValue as number, currencyFormat) : '',
    };

    if (policy.isAnnuity) {
        return [premiumsCard, withdrawalsCard, fundsCard];
    }

    return [premiumsCard, withdrawalsCard, loansCard, fundsCard];
};

export const mapPolicyTimelineValues = (policy: PolicyDetails, t: TFunction): PolicyTimelineCardData => {
    const { policyTerm, policyYear, fixedCostPeriod, issueDate, maturityDate } = policy;

    const freeLookFeature = policy.features.getFirstFeatureByType(FeatureType.FREELOOK);

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
    const fixedCostPeriodLeft =
        !isNullEmptyOrUndefined(fixedCostPeriod as number) && !isNullEmptyOrUndefined(policyYear as number)
            ? (fixedCostPeriod as number) - Number(policyYear)
            : undefined;
    return {
        fixedCostPeriod,
        fixedCostPeriodLeft,
        freeLookCancelDate: freeLookFeature?.endDate,
        issueDate: convertKebabedDateString(issueDate),
        maturityDate: maturityDate ? convertKebabedDateString(maturityDate) : null,
        policyAge: translateYearOrYears(policyYear, t),
        policyLength,
        policyYearsLeft,
    };
};

export const getApplicationDetailsData = (policy: PolicyDetails, t: TFunction): ApplicationDetailsCardData => {
    return {
        issueState: getStateName(policy?.issueState),
        salesChannel: mapDistribution(policy.distribution, t),
        originalPolicyNumber: policy?.policy?.parentPolicyNumber ?? DEFAULT_ERROR_STRING,
        applicationSource: policy?.policy?.policySource ?? DEFAULT_ERROR_STRING,
        applicationSourceDetails: policy?.policy?.policySourceDescription ?? DEFAULT_ERROR_STRING,
    };
};
