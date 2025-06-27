import {
    FeatureType,
    Policy,
    ArrangementType,
    FundAccountType,
} from '@zinnia/api-types/types/sor';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { DataDefinition } from '@deps/types/data';

export interface AnnuityViewDetailsDto {
    applicationReceivedData: string;
    issueDate: string;
    freeLookExpirationDate: string;
    maturityDate: string;
    accountValue: number;
    netSurrenderValue: number;
    baseDeathBenefit: number;
    cumulativePremiumSinceIssue: number;
    planCode: string;
    productName: string;
    generalLedgerPlanCode: string;
    withdrawalAutopayAmount: number;
    withdrawalAutopayFrequency: string;
    withdrawalAutopayNextPaymentDate: string;
    totalWithdrawalAmount: number;
    ytdWithdrawalAmount: number;
    maxWithdrawalAmount: number;
    minWithdrawalAmount: number;
    rmdAutopayAmount: number;
    rmdAutopayFrequency: string;
    rmdAutopayNextPaymentDate: string;
    rmdAnnuallyRequired: number;
    rmdRemainingAmount: number;
    payoutAutopayAmount: number;
    payoutAutopayFrequency: string;
    payoutAutopayNextPaymentDate: string;
    payoutOption: string;
    payoutAlltime: number;
    payoutYtd: number;
    totalFundValue: number | any;
}

/**
 *
 * Generates the searchable data for the annuities key/value bar
 */
export const toAnnuityViewDetailsDto = (
    policy: Policy
): AnnuityViewDetailsDto => {
    if (!policy) return {} as AnnuityViewDetailsDto;

    const {
        accountValues,
        coverage,
        withdrawalValues,
        policyFeatures,
        policyDates,
    } = policy;

    const freeLookFeature = (policyFeatures ?? []).find(
        (feature) => feature.featureType === FeatureType.FREELOOK
    );

    const baseDeathBenefit = coverage?.coverageLayers?.[0]?.currentAmount ?? 0;

    const withdrawalAutopayDetails = policy.systematicPrograms?.find(
        (sp) => sp.arrangementType === ArrangementType.WITHDRAWAL
    );
    const withdrawalAutopayAmount = withdrawalAutopayDetails?.amount || 0;
    const withdrawalAutopayFrequency =
        withdrawalAutopayDetails?.frequency || '';
    const withdrawalAutopayNextPaymentDate =
        withdrawalAutopayDetails?.nextProgramDate || '';

    //TODO: Is this the correct mapping?
    const minDistDetails = policy.systematicPrograms?.find(
        (sp) =>
            sp.arrangementType === ArrangementType.REQUIREDMINIMUMDISTRIBUTION
    );
    const rmdAutopayAmount = minDistDetails?.amount || 0;
    const rmdAutopayFrequency = minDistDetails?.frequency || '';
    const rmdAutopayNextPaymentDate = minDistDetails?.nextProgramDate || '';

    const rmdAnnuallyRequired =
        policy.requiredMinimumDistribution
            ?.totalRequiredMinimumDistributionAnnualAmount;
    const rmdRemainingAmount =
        policy.requiredMinimumDistribution
            ?.remainingRequiredMinimumDistributionAmount;

    //TODO: Is this the correct mapping?
    const payoutDetails = policy.systematicPrograms?.find(
        (sp) => sp.arrangementType === ArrangementType.PAYOUT
    );
    const payoutAutopayAmount = payoutDetails?.amount || 0;
    const payoutAutopayFrequency = payoutDetails?.frequency || '';
    const payoutAutopayNextPaymentDate = payoutDetails?.nextProgramDate || '';
    const annuitizationDetails = policy.policyFeatures?.find(
        (sp) => sp.featureType === FeatureType.ANNUITIZATION
    );
    const payoutOption = annuitizationDetails?.featureOption || '';
    const payoutAlltime = annuitizationDetails?.totalPaymentAmount || 0;
    const payoutYtd = annuitizationDetails?.yearToDatePaymentAmount || 0;
    const totalFundValue = policy?.allocation?.funds?.find(
        (fund) => fund.fundAccountType === FundAccountType.FIXED
    )?.totalFundValue;

    return Object.assign(
        {},
        {
            //details
            applicationReceivedData: policyDates?.applicationReceivedDate || '',
            issueDate: policyDates?.issueDate || '',
            freeLookExpirationDate: freeLookFeature?.endDate || '',
            maturityDate: policyDates?.maturityDate || '',
            accountValue: accountValues?.endingAccountValue || 0,
            netSurrenderValue: accountValues?.surrenderValue || 0,

            //coverage
            baseDeathBenefit: baseDeathBenefit || 0,

            //premium
            cumulativePremiumSinceIssue:
                policy.accountValues?.cumulativePremiumSinceIssue || 0, //TODO: Is this the correct mapping?

            //product
            planCode: policy?.product?.planCode || '',
            productName: policy.product?.planName || '',
            generalLedgerPlanCode: policy.product?.generalLedgerPlanCode || '',

            //withdrawals
            withdrawalAutopayAmount: withdrawalAutopayAmount || 0,
            withdrawalAutopayFrequency: withdrawalAutopayFrequency || '',
            withdrawalAutopayNextPaymentDate:
                withdrawalAutopayNextPaymentDate || '',
            totalWithdrawalAmount: withdrawalValues?.totalWithdrawalAmount || 0,
            maxWithdrawalAmount: withdrawalValues?.maximumWithdrawalAmount || 0,
            minWithdrawalAmount: withdrawalValues?.minimumWithdrawalAmount || 0,
            ytdWithdrawalAmount:
                withdrawalValues?.totalYearToDateWithdrawalTaken || 0,
            //required min distr
            rmdAutopayAmount: rmdAutopayAmount || 0,
            rmdAutopayFrequency: rmdAutopayFrequency || '',
            rmdAutopayNextPaymentDate: rmdAutopayNextPaymentDate || '',
            rmdAnnuallyRequired: rmdAnnuallyRequired || 0,
            rmdRemainingAmount: rmdRemainingAmount || 0,

            //annuitization and payout
            payoutAutopayAmount: payoutAutopayAmount || 0,
            payoutAutopayFrequency: payoutAutopayFrequency || '',
            payoutAutopayNextPaymentDate: payoutAutopayNextPaymentDate || '',
            payoutOption: payoutOption || '',
            payoutAlltime: payoutAlltime || 0,
            payoutYtd: payoutYtd || 0,

            //funds
            totalFundValue: totalFundValue || 0,
        }
    );
};

export const AnnuityDetailsViewInfo =
    (): DataDefinition<AnnuityViewDetailsDto>[] => {
        return [
            {
                key: 'applicationReceivedData',
                label: 'Application Received Date',
                format: convertKebabedDateString,
                group: 'policy_details',
            },
            {
                key: 'issueDate',
                label: 'Issue Date',
                format: convertKebabedDateString,
                group: 'policy_details',
            },
            {
                key: 'freeLookExpirationDate',
                label: 'Free Look Expiration Date',
                format: convertKebabedDateString,
                group: 'policy_details',
            },
            {
                key: 'maturityDate',
                label: 'Maturity Date',
                format: convertKebabedDateString,
                group: 'policy_details',
            },
            {
                key: 'accountValue',
                label: 'Account Value',
                format: numberFormatify,
                group: 'policy_details',
            },
            {
                key: 'netSurrenderValue',
                label: 'Net Surrender Value',
                format: numberFormatify,
                group: 'policy_details',
            },
            {
                key: 'baseDeathBenefit',
                label: 'Base Death Benefit',
                format: numberFormatify,
                group: 'policy_coverage',
            },
            {
                key: 'cumulativePremiumSinceIssue',
                label: 'All-Time Premium',
                format: numberFormatify,
                group: 'premium',
            },
            {
                key: 'planCode',
                label: 'Plan Code',
                group: 'product',
            },
            {
                key: 'productName',
                label: 'Product Name',
                group: 'product',
            },
            {
                key: 'generalLedgerPlanCode',
                label: 'General Ledger Plan Code',
                group: 'product',
            },
            {
                key: 'withdrawalAutopayAmount',
                label: 'Withdrawal Autopay Amount',
                format: numberFormatify,
                group: 'withdrawals',
            },
            {
                key: 'withdrawalAutopayFrequency',
                label: 'Withdrawal Autopay Frequency',
                group: 'withdrawals',
            },
            {
                key: 'withdrawalAutopayNextPaymentDate',
                label: 'Withdrawal Autopay Next Payment Date',
                format: convertKebabedDateString,
                group: 'withdrawals',
            },
            {
                key: 'totalWithdrawalAmount',
                label: 'Total Withdrawal Amount',
                format: numberFormatify,
                group: 'withdrawals',
            },
            {
                key: 'ytdWithdrawalAmount',
                label: 'YTD Withdrawal Amount',
                format: numberFormatify,
                group: 'withdrawals',
            },
            {
                key: 'maxWithdrawalAmount',
                label: 'Max Withdrawal Amount',
                format: numberFormatify,
                group: 'withdrawals',
            },
            {
                key: 'minWithdrawalAmount',
                label: 'Min Withdrawal Amount',
                format: numberFormatify,
                group: 'withdrawals',
            },
            {
                key: 'rmdAutopayAmount',
                label: 'RMD Autopay Amount',
                format: numberFormatify,
                group: 'required_min_distr',
            },
            {
                key: 'rmdAutopayFrequency',
                label: 'RMD Autopay Frequency',
                group: 'required_min_distr',
            },
            {
                key: 'rmdAutopayNextPaymentDate',
                label: 'RMD Autopay Next Payment Date',
                format: convertKebabedDateString,
                group: 'required_min_distr',
            },
            {
                key: 'rmdAnnuallyRequired',
                label: 'RMD Annually Required',
                format: numberFormatify,
                group: 'required_min_distr',
            },
            {
                key: 'rmdRemainingAmount',
                label: 'RMD Remaining Amount',
                format: numberFormatify,
                group: 'required_min_distr',
            },
            {
                key: 'payoutAutopayAmount',
                label: 'Payout Autopay Amount',
                format: numberFormatify,
                group: 'annuitization_and_payout',
            },
            {
                key: 'payoutAutopayFrequency',
                label: 'Payout Autopay Frequency',
                group: 'annuitization_and_payout',
            },
            {
                key: 'payoutAutopayNextPaymentDate',
                label: 'Payout Autopay Next Payment Date',
                format: convertKebabedDateString,
                group: 'annuitization_and_payout',
            },
            //TODO: Enable this when we have prettier values to map the enum to
            // {
            //     key: 'payoutOption',
            //     label: 'Payout Option',
            //     group: 'annuitization_and_payout',
            // },
            {
                key: 'payoutAlltime',
                label: 'All-time payout',
                format: numberFormatify,
                group: 'annuitization_and_payout',
            },
            {
                key: 'payoutYtd',
                label: 'YTD Payout',
                format: numberFormatify,
                group: 'annuitization_and_payout',
            },
            {
                key: 'totalFundValue',
                label: 'Total Fund Value',
                format: numberFormatify,
                group: 'funds',
            },
        ];
    };
