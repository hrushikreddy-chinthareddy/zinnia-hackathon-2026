import { FundAccountType, Policy, FeatureType } from '@zinnia/api-types/types/sor';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString, isNullEmptyOrUndefined, toSentenceCase } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { DataDefinition } from '@deps/types/data';

export interface PolicyViewDetailsDto {
    issueDate: string;
    freeLookExpirationDate: string;
    maturityDate: string;
    accountValue: number;
    netSurrenderValue: number;
    minRequiredAccountValue: number;
    contestabilityPeriodStartDate: string;
    contestabilityPeriodEndDate: string;
    faceAmount: number;
    minCoverageAmount: number;
    maxCoverageAmount: number;
    availableIncrease: number;
    availableDecrease: number;
    costBasis: number;
    totalPremiumAmount: number;
    cumulativePremiumSinceIssue: number;
    amountRemainingUntilCurrentGuidelineLimit: number;
    guidelineBasis: number;
    amountRemainingUntilCurrentSevenPayLimit: number;
    sevenPayPremiumBasis: number;
    planCode: string;
    productName: string;
    generalLedgerPlanCode: string;
    totalNumberOfLoans: number;
    minLoanAmount: number;
    maxLoanAmount: number;
    totalLoanPolicyBalance: number;
    loanedPortionOfAccountValue: number;
    eligibleForLoan: number;
    totalLoanPrincipal: number;
    totalLoanAccruedInterest: number;
    loanInterestMethod: string;
    totalWithdrawalAmount: number;
    maxWithdrawalAmount: number;
    minWithdrawalAmount: number;
    totalFundValue: number | any;
}

export const toPolicyViewDetailsDto = (policy: Policy): PolicyViewDetailsDto => {
    if (!policy) return {} as PolicyViewDetailsDto;

    const { accountValues, coverage, loanValues, withdrawalValues, policyFeatures, policyDates, testValues } = policy;

    const freeLookFeature = (policyFeatures ?? []).find(feature => feature.featureType === FeatureType.FREELOOK);

    const baseDeathBenefit = coverage?.coverageLayers?.[0]?.currentAmount ?? 0;
    const minCoverageAmount = coverage?.coverageLayers?.[0]?.minimumCoverageAmount ?? 0;
    const maxCoverageAmount = coverage?.coverageLayers?.[0]?.maximumCoverageAmount ?? 0;
    const availableDecrease = baseDeathBenefit - minCoverageAmount;
    const availableIncrease = maxCoverageAmount - baseDeathBenefit;

    const guidelineBasis =
        (policy?.accountValues?.cumulativePremiumSinceIssue || 0) - (policy?.withdrawalValues?.totalWithdrawalAmount || 0);

    const totalFundValue = policy?.allocation?.funds?.find(fund => fund.fundAccountType === FundAccountType.FIXED);

    return Object.assign(
        {},
        {
            issueDate: policyDates?.issueDate || '',
            freeLookExpirationDate: freeLookFeature?.endDate || '',
            maturityDate: policyDates?.maturityDate || '',
            accountValue: accountValues?.endingAccountValue || 0,
            netSurrenderValue: accountValues?.surrenderValue || 0,
            minRequiredAccountValue: accountValues?.minimumRequiredAccountValue || 0,
            contestabilityPeriodStartDate: policyDates?.contestabilityStartDate || '',
            contestabilityPeriodEndDate: policyDates?.contestabilityEndDate || '',
            faceAmount: coverage?.totalCoverageAmount || 0,
            minCoverageAmount: coverage?.minimumCoverageAmount || 0,
            maxCoverageAmount: coverage?.maximumCoverageAmount || 0,
            availableIncrease: availableIncrease || 0,
            availableDecrease: availableDecrease || 0,
            costBasis: policy?.costBasis?.costBasis || 0,
            totalPremiumAmount: accountValues?.totalYearToDatePremiumAmount || 0,
            cumulativePremiumSinceIssue: accountValues?.cumulativePremiumSinceIssue || 0,
            amountRemainingUntilCurrentGuidelineLimit:
                (policy?.testValues?.guidelinePremium?.guidelineSinglePremium || 0) - guidelineBasis || 0,
            guidelineBasis: guidelineBasis || 0,
            amountRemainingUntilCurrentSevenPayLimit:
                (testValues?.modifiedEndowmentContract?.sevenPayLimit || 0) -
                    (testValues?.modifiedEndowmentContract?.sevenPayTestBasis || 0) || 0,
            sevenPayPremiumBasis: testValues?.modifiedEndowmentContract?.sevenPayTestBasis || 0,
            planCode: policy?.product?.planCode || '',
            productName: policy.product?.planName || '',
            generalLedgerPlanCode: policy.product?.generalLedgerPlanCode || '',
            totalNumberOfLoans: loanValues?.totalNumberOfLoan || 0,
            minLoanAmount: loanValues?.minimumLoanAmount || 0,
            maxLoanAmount: loanValues?.maximumLoanAmount || 0,
            totalLoanPolicyBalance: loanValues?.totalLoanBalance || 0,
            loanedPortionOfAccountValue: loanValues?.totalLoanBalance || 0,
            eligibleForLoan: loanValues?.maximumLoanAmount || 0,
            totalLoanPrincipal: loanValues?.totalLoanPrincipal || 0,
            totalLoanAccruedInterest: loanValues?.totalLoanAccruedInterest || 0,
            loanInterestMethod: loanValues?.loanInterestMethod || '',
            totalWithdrawalAmount: withdrawalValues?.totalWithdrawalAmount || 0,
            maxWithdrawalAmount: withdrawalValues?.maximumWithdrawalAmount || 0,
            minWithdrawalAmount: withdrawalValues?.minimumWithdrawalAmount || 0,
            totalFundValue: totalFundValue?.totalFundValue || 0,
        }
    );
};

export const PolicyDetailsViewInfo = (): DataDefinition<PolicyViewDetailsDto>[] => {
    return [
        {
            key: 'issueDate',
            label: 'Issue date',
            format: convertKebabedDateString,
            group: 'policy_details',
        },
        {
            key: 'freeLookExpirationDate',
            label: 'Free look expiration date',
            format: convertKebabedDateString,
            group: 'policy_details',
        },
        {
            key: 'maturityDate',
            label: 'Maturity date',
            format: convertKebabedDateString,
            group: 'policy_details',
        },
        {
            key: 'accountValue',
            label: 'Account value',
            format: numberFormatify,
            group: 'policy_details',
        },
        {
            key: 'netSurrenderValue',
            label: 'Net surrender value',
            format: numberFormatify,
            group: 'policy_details',
        },
        {
            key: 'minRequiredAccountValue',
            label: 'Min required account value',
            format: numberFormatify,
            group: 'policy_details',
        },
        {
            key: 'contestabilityPeriodStartDate',
            label: 'Contestability period start date',
            format: convertKebabedDateString,
            group: 'policy_details',
        },
        {
            key: 'contestabilityPeriodEndDate',
            label: 'Contestability period end date',
            format: convertKebabedDateString,
            group: 'policy_details',
        },
        {
            key: 'faceAmount',
            label: 'Base death benefit',
            format: numberFormatify,
            group: 'policy_coverage',
        },
        {
            key: 'minCoverageAmount',
            label: 'Min coverage amount',
            format: numberFormatify,
            group: 'policy_coverage',
        },
        {
            key: 'maxCoverageAmount',
            label: 'Max coverage amount',
            format: numberFormatify,
            group: 'policy_coverage',
        },
        {
            key: 'availableIncrease',
            label: 'Available increase',
            format: numberFormatify,
            group: 'policy_coverage',
        },
        {
            key: 'availableDecrease',
            label: 'Available decrease',
            format: numberFormatify,
            group: 'policy_coverage',
        },
        {
            key: 'costBasis',
            label: 'Cost basis',
            format: numberFormatify,
            group: 'premium',
        },
        {
            key: 'totalPremiumAmount',
            label: 'YTD premium',
            format: numberFormatify,
            group: 'premium',
        },
        {
            key: 'cumulativePremiumSinceIssue',
            label: 'All-time premium',
            format: numberFormatify,
            group: 'premium',
        },
        {
            key: 'amountRemainingUntilCurrentGuidelineLimit',
            label: 'Amount remaining until current guideline limit',
            format: numberFormatify,
            group: 'premium',
        },
        {
            key: 'guidelineBasis',
            label: 'Guideline basis',
            format: numberFormatify,
            group: 'premium',
        },
        {
            key: 'amountRemainingUntilCurrentSevenPayLimit',
            label: 'Amount remaining unitl current 7-pay limit',
            format: numberFormatify,
            group: 'premium',
        },
        {
            key: 'sevenPayPremiumBasis',
            label: '7-pay premium basis',
            format: numberFormatify,
            group: 'premium',
        },
        {
            key: 'planCode',
            label: 'Plan code',
            group: 'product',
        },
        {
            key: 'productName',
            label: 'Product name',
            group: 'product',
        },
        {
            key: 'generalLedgerPlanCode',
            label: 'GL product code',
            group: 'product',
        },
        {
            key: 'totalNumberOfLoans',
            label: 'Total number of loans',
            defaultValue: '0',
            group: 'loans',
        },
        {
            key: 'minLoanAmount',
            label: 'Min loan amount',
            format: numberFormatify,
            group: 'loans',
        },
        {
            key: 'maxLoanAmount',
            label: 'Max loan amount',
            format: numberFormatify,
            group: 'loans',
        },
        {
            key: 'totalLoanPolicyBalance',
            label: 'Total loan balance',
            format: numberFormatify,
            group: 'loans',
        },
        {
            key: 'loanedPortionOfAccountValue',
            label: 'Loaned portion of account value',
            format: numberFormatify,
            group: 'loans',
        },
        {
            key: 'eligibleForLoan',
            label: 'Eligible for Loan',
            format: numberFormatify,
            group: 'loans',
        },
        {
            key: 'totalLoanPrincipal',
            label: 'Total loan principal',
            format: numberFormatify,
            group: 'loans',
        },
        {
            key: 'totalLoanAccruedInterest',
            label: 'Total Loan Accrued Interest',
            format: numberFormatify,
            group: 'loans',
        },
        {
            key: 'loanInterestMethod',
            label: 'Loan Interest Method',
            group: 'loans',
            format: (value?: any) => {
                return !isNullEmptyOrUndefined(value) ? toSentenceCase(value as string) : DEFAULT_ERROR_STRING;
            },
        },
        {
            key: 'totalWithdrawalAmount',
            label: 'All-time withdrawals',
            format: numberFormatify,
            group: 'withdrawals',
        },
        {
            key: 'maxWithdrawalAmount',
            label: 'Eligible for withdrawal',
            format: numberFormatify,
            group: 'withdrawals',
        },
        {
            key: 'minWithdrawalAmount',
            label: 'Min withdrawal amount',
            format: numberFormatify,
            group: 'withdrawals',
        },
        {
            key: 'totalFundValue',
            label: 'Total fund value',
            format: numberFormatify,
            group: 'funds',
        },
    ];
};
