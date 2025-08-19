import {
    DistributionType,
    FeatureType,
    PolicyFeatureBase,
} from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { ApplicationDetailsCardData } from '@deps/containers/policy-details/cards/application-details/types';
import { PolicyTimelineCardData } from '@deps/containers/policy-details/cards/timeline-card.types';
import { TransactionCardProps } from '@deps/containers/policy-details/cards/transaction-card';
import { isEndDated } from '@deps/helpers/date.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getStateName } from '@deps/helpers/states.helpers';
import {
    convertKebabedDateString,
    isNullEmptyOrUndefined,
    toSentenceCase,
    translateYearOrYears,
} from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

const distributionMapping: { [key: DistributionType | string]: string } = {
    [DistributionType.AFFILIATEDAGENCY]:
        'policy.distributionType.affiliatedAgency',
    [DistributionType.BANKMARKET]: 'policy.distributionType.bankMarket',
    [DistributionType.BROKERDEALER]: 'policy.distributionType.brokerDealer',
    ['BROKER_DEALER' as DistributionType]:
        'policy.distributionType.broker_Dealer',
    [DistributionType.BROKERAGEINDEPENDENTMARKET]:
        'policy.distributionType.brokerageIndependentMarket',
    [DistributionType.CAPTIVEMARKET]: 'policy.distributionType.captiveMarket',
    [DistributionType.FINANCIALINSTITUTION]:
        'policy.distributionType.financialInstitution',
    [DistributionType.FINANCIALPLANNINGFIRM]:
        'policy.distributionType.financialPlanningFirm',
    [DistributionType.INDEPENDENTAGENCY]:
        'policy.distributionType.independentAgency',
    [DistributionType.INSTITUTIONALMARKET]:
        'policy.distributionType.institutionalMarket',
    [DistributionType.REGISTEREDINVESTMENTADVISER]:
        'policy.distributionType.registeredInvestmentAdviser',
    [DistributionType.THIRDPARTYDIRECTTOCONSUMER]: `policy.distributionType.thirdPartyDirectToConsumer`,
    [DistributionType.WIREHOUSE]: 'policy.distributionType.wirehouse',
};

export const mapDistribution = (
    distribution: DistributionType | string = DEFAULT_ERROR_STRING,
    t: TFunction
): string => {
    return distributionMapping[distribution]
        ? t(distributionMapping[distribution])
        : distribution;
};

export const buildTransactionCards = (
    policy: PolicyDetails,
    t: TFunction,
    visibility: {
        showFundsAndAccounts: boolean;
        showLoans: boolean;
        showWithdrawals: boolean;
    }
): TransactionCardProps[] => {
    const { policyNumber, planCode, currency, isAnnuity } = policy;
    // BPB - TODO: add these to PolicyDetails
    const {
        accountValues,
        withdrawalValues,
        loanValues,
        allocation,
        requiredMinimumDistribution,
    } = policy.policy;
    const cumulativePremiumSinceIssue =
        accountValues?.cumulativePremiumSinceIssue;
    const fundValue = isAnnuity
        ? accountValues?.endingAccountValue
        : allocation?.funds?.[0]?.totalFundValue;
    const policyGainAmount = accountValues?.policyGainAmount;
    const lastDeposit =
        allocation?.funds?.[0]?.fundSegments?.[0]?.depositAmount;
    const loansAmount = loanValues?.totalLoanBalance;
    const loansCount = loanValues?.totalNumberOfLoan;
    const withdrawalAmount = isAnnuity
        ? withdrawalValues?.totalYearToDateWithdrawalTaken
        : withdrawalValues?.totalWithdrawalAmount;
    const withdrawalCount = withdrawalValues?.numberOfWithdrawal;
    const ytdPremiums = accountValues?.totalYearToDatePremiumAmount;
    const totalReqMinDistributionAmount =
        requiredMinimumDistribution?.totalRequiredMinimumDistributionAnnualAmount;
    const reqRemainigDistributionAmountAmount =
        requiredMinimumDistribution?.remainingRequiredMinimumDistributionAmount;

    const currencyFormat: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
    };

    const premiumsCard = {
        cardTitle: t('premiums'),
        fieldLabel: isAnnuity ? t('cumulativePremium') : t('allTimePremium'),
        href: `/policies/${planCode}/${policyNumber}/policy/premiums`,
        summary: `${t('ytd')} ${numberFormatify(
            ytdPremiums as number,
            currencyFormat
        )}`,
        value: numberFormatify(
            cumulativePremiumSinceIssue as number,
            currencyFormat
        ),
    };

    const withdrawalsCard = {
        cardTitle: t('withdrawals'),
        fieldLabel: isAnnuity
            ? t('cumulativeWithdrawals')
            : t('withdrawalsTaken'),
        href: `/policies/${planCode}/${policyNumber}/policy/withdrawals`,
        summary: `${isAnnuity ? t('ytd') : t('total')} ${numberFormatify(
            withdrawalAmount as number,
            currencyFormat
        )}`,
        value: isAnnuity
            ? numberFormatify(
                  withdrawalValues?.totalWithdrawalAmount as number,
                  currencyFormat
              )
            : withdrawalCount || 0,
    };

    const rmdCard = {
        cardTitle: t('rmds'),
        fieldLabel: t('eligibility'),
        href: `/policies/${planCode}/${policyNumber}/policy/withdrawals`,
        summary:
            totalReqMinDistributionAmount === 0 ||
            totalReqMinDistributionAmount == null
                ? ''
                : `${reqRemainigDistributionAmountAmount} ${t(
                      'yearsRemaining'
                  )}`,
        value:
            totalReqMinDistributionAmount && totalReqMinDistributionAmount > 0
                ? t('eligible')
                : totalReqMinDistributionAmount === 0 ||
                  totalReqMinDistributionAmount === null
                ? t('ineligible')
                : t('notAvailable'),
    };

    const loansCard = {
        cardTitle: t('loans'),
        fieldLabel: t('loansTaken'),
        href: `/policies/${planCode}/${policyNumber}/policy/loans`,
        summary: `${t('total')} ${numberFormatify(
            loansAmount as number,
            currencyFormat
        )}`,
        value: Number(loansCount),
    };

    const fundsCard = {
        cardTitle: t('funds'),
        fieldLabel: isAnnuity ? t('accountValue') : t('totalFundValue'),
        href: `/policies/${planCode}/${policyNumber}/policy/funds`,
        summary: `${
            isAnnuity ? t('gains') : t('lastDeposit')
        } ${numberFormatify(
            (isAnnuity ? policyGainAmount : lastDeposit) as number,
            currencyFormat
        )}`,
        value: numberFormatify(fundValue as number, currencyFormat),
    };

    if (policy.isAnnuity) {
        return [premiumsCard, withdrawalsCard, rmdCard, fundsCard];
    }
    const cards: TransactionCardProps[] = [premiumsCard];

    if (visibility.showWithdrawals) {
        cards.push(withdrawalsCard);
    }

    if (!policy.isAnnuity && visibility.showLoans) {
        cards.push(loansCard);
    }

    if (visibility.showFundsAndAccounts) {
        cards.push(fundsCard);
    }
    return cards;
};

export const mapPolicyTimelineValues = (
    policy: PolicyDetails,
    t: TFunction
): PolicyTimelineCardData => {
    const { policyTerm, policyYear, fixedCostPeriod, issueDate, maturityDate } =
        policy;

    const freeLookFeature = policy.features.getFirstFeatureByType(
        FeatureType.FREELOOK
    );

    const policyLength = !policyTerm
        ? !maturityDate
            ? t('policy.detailCards.policyTimeline.lifetime')
            : DEFAULT_ERROR_STRING
        : translateYearOrYears(policyTerm, t);
    const policyYearsLeft =
        !isNullEmptyOrUndefined(policyTerm as number) &&
        !isNullEmptyOrUndefined(policyYear as number) &&
        !isNullEmptyOrUndefined(maturityDate)
            ? t('temporal.timeLeft', {
                  timespan: translateYearOrYears(
                      (policyTerm as number) - Number(policyYear),
                      t
                  ),
              })
            : null;
    const fixedCostPeriodLeft =
        !isNullEmptyOrUndefined(fixedCostPeriod as number) &&
        !isNullEmptyOrUndefined(policyYear as number)
            ? (fixedCostPeriod as number) - Number(policyYear)
            : undefined;

    return {
        fixedCostPeriod,
        fixedCostPeriodLeft,
        freeLookCancelDate: freeLookFeature?.endDate,
        issueDate: convertKebabedDateString(issueDate),
        maturityDate: maturityDate
            ? convertKebabedDateString(maturityDate)
            : null,
        policyAge: toSentenceCase(policyYear?.toString()),
        policyLength,
        policyYearsLeft,
    };
};

export const getApplicationDetailsData = (
    policy: PolicyDetails,
    t: TFunction
): ApplicationDetailsCardData => {
    const customFeatures = policy.getFeaturesByType(FeatureType.CUSTOMFEATURE);
    const multiplePolicyDiscountFeature = customFeatures.filter(
        (feature) =>
            feature.featureSubType ===
            PolicyFeatureBase.featureSubType.MULTIPLEPOLICYDISCOUNT
    );

    const multiplePolicyDiscountIndicator =
        multiplePolicyDiscountFeature.reduce(
            (acc: Pick<PolicyFeatureBase, 'featureIndicator'>, curr) => {
                if (
                    curr.featureSubType ===
                    PolicyFeatureBase.featureSubType.MULTIPLEPOLICYDISCOUNT
                ) {
                    const { endDate, featureIndicator } = curr;

                    if (!isEndDated(endDate)) {
                        return { featureIndicator };
                    }
                }
                return acc;
            },
            { featureIndicator: false }
        );

    // Group discount should only be shown for policies where the feature exists (DEPU-5046)
    let multiPolicyDiscount = null;
    if (multiplePolicyDiscountFeature.length) {
        multiPolicyDiscount = multiplePolicyDiscountIndicator.featureIndicator
            ? t('yes')
            : t('no');
    }
    return {
        issueState: getStateName(policy?.issueState),
        salesChannel: mapDistribution(policy.distribution, t),
        originalPolicyNumber:
            policy?.policy?.parentPolicyNumber ?? DEFAULT_ERROR_STRING,
        applicationSource: policy?.policy?.policySource ?? DEFAULT_ERROR_STRING,
        applicationSourceDetails:
            policy?.policy?.policySourceDescription ?? DEFAULT_ERROR_STRING,
        multiPolicyDiscount,
    };
};
