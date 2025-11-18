import { TransactionResponse } from '@xd/api-types/dist/generated-types/bpm';
import {
  FeatureType,
  PolicyFeature,
  PolicyStatus,
  ProductType,
  Transaction,
} from '@xd/api-types/dist/generated-types/sor';
import { standardDateMonthDayYear } from '@xd/utils/dist';

import {
  getAddSystematicProgramEligibility,
  getUpdateSystematicProgramEligibility,
} from '@/services/bpm/systematic-programs';
import { PaymentMethod } from '@/types/payment';
import { CommonLogContext } from '@/utils/logging/server-logging';

import { getMostRecentTransactionPaymentInfo } from './utils/transactionPaymentInfo';

export enum AutopayStatus {
  MANAGE = 'manage',
  SETUP = 'setup',
}

export const determineAutopayDisplayAndEligibility = async ({
  arrangementId,
  loggingContext,
  planCode,
  policyNumber,
}: {
  arrangementId?: string;
  loggingContext: CommonLogContext;
  planCode: string;
  policyNumber: string;
}) => {
  // TODO: I don't love the name of this is...it's indicating if it's setup or manage
  let autopayCurrentState = AutopayStatus.SETUP;
  let cancelAutopayEligible = false;
  let manageAutopayEligible = false;
  let addAutopayEligible = false;

  if (arrangementId) {
    const { data: systematicProgramEligibility } =
      await getUpdateSystematicProgramEligibility(
        {
          planCode,
          policyNumber,
          arrangementId: arrangementId,
        },
        loggingContext
      );

    const isEligible = !!systematicProgramEligibility?.isEligible;
    manageAutopayEligible = isEligible;
    cancelAutopayEligible = isEligible;
    autopayCurrentState = AutopayStatus.MANAGE;
  }

  // The reason we check this if manageAutopay is false is because there are times
  // when an arrangmentId exists BUT the policy is no longer eligbile for editing that
  // autopay for example if there is a terminated systematic premium, we need to check
  // to see if the user can add a new one
  if (!arrangementId || !manageAutopayEligible) {
    // TODO: need to update this endpoint to use the correct pattern for BPM results
    // e.g. with the isEligible formatter
    const addSystematicPremiumEligibilityResult =
      await getAddSystematicProgramEligibility(
        {
          planCode,
          policyNumber,
        },
        loggingContext
      );

    // TODO: there is still a gap here where the user is ineligible for editing but
    // that's the correct state to display... that's probably an edge case though
    addAutopayEligible =
      addSystematicPremiumEligibilityResult.data?.status ===
      TransactionResponse.status.SUCCESS;
    autopayCurrentState = AutopayStatus.SETUP;
  }

  return {
    cancelAutopayEligible,
    addManageEligible: manageAutopayEligible || addAutopayEligible,
    autopayCurrentState,
  };
};

export const upcomingPaymentDetails = ({
  policyStatus,
  policyFeatures,
  upcomingPaymentValid,
  upcomingPaymentAmount,
  nextActivityDate,
  productType,
  transactions,
  paymentMethods,
  hasActiveAutopay,
}: {
  policyStatus: PolicyStatus;
  policyFeatures?: PolicyFeature[] | null;
  upcomingPaymentValid?: boolean;
  upcomingPaymentAmount?: number;
  nextActivityDate: string;
  productType?: ProductType;
  transactions?: Transaction[];
  paymentMethods?: PaymentMethod[];
  hasActiveAutopay?: boolean;
}): {
  scheduledPayment?: {
    amount?: number;
    label: string;
    caption?: string | null;
  };
  premiumDue: { amount: number; label: string; caption?: string | null };
} => {
  let scheduledPayment;
  let premiumDue;

  if (policyStatus === PolicyStatus.PENDINGLAPSE) {
    const pendingLapseDueDetails = policyFeatures?.find(
      item => item.featureType === FeatureType.LAPSEASSESSMENT
    );

    premiumDue = {
      amount: pendingLapseDueDetails?.totalMinimumRequiredAmount ?? 0,
      label: 'Premium due',
      caption:
        pendingLapseDueDetails?.endDate &&
        `Due: ${standardDateMonthDayYear(pendingLapseDueDetails?.endDate)}`,
    };
  } else {
    const billingFeature = policyFeatures?.find(
      item => item.featureType === FeatureType.BILLING
    );

    premiumDue = {
      amount: billingFeature?.paymentAmount ?? 0,
      label: 'Premium due',
      caption:
        billingFeature?.effectiveDate &&
        `Due: ${standardDateMonthDayYear(billingFeature?.effectiveDate)}`,
    };
  }

  if (
    policyStatus !== PolicyStatus.PENDINGLAPSE &&
    upcomingPaymentValid &&
    upcomingPaymentAmount
  ) {
    let paymentCaption =
      nextActivityDate &&
      `Autopay on ${standardDateMonthDayYear(nextActivityDate)}`;

    if (transactions && paymentMethods) {
      const paymentInfo = getMostRecentTransactionPaymentInfo(
        transactions,
        paymentMethods,
        hasActiveAutopay
      );

      if (paymentInfo?.paymentDescription) {
        paymentCaption = paymentInfo.paymentDescription;
      }
    }

    scheduledPayment = {
      amount: upcomingPaymentAmount,
      label: 'Next scheduled payment',
      caption: paymentCaption,
    };
  }

  return {
    scheduledPayment,
    premiumDue,
  };
};
