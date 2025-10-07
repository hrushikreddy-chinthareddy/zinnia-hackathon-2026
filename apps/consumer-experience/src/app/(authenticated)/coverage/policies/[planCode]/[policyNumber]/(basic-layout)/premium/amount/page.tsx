import { FeatureType, PolicyStatus } from '@zinnia/api-types/types/sor';

import { SelectAmount } from '@/components/stepped-workflow/workflows/one-time-premium/forms/SelectAmount';
import { OneTimePremium } from '@/components/stepped-workflow/workflows/one-time-premium/OneTimePremium';
import { getPolicyDetails, getPolicyStatusDetails } from '@/services';
import { getComponentVisibility } from '@/services/display-rules';
import { ComponentName } from '@/services/display-rules/types';
import { getPolicyFeatures } from '@/services/policy/features';
import {
  ConfiguredSettingId,
  getCarrierProductOneTimePaymentFee,
} from '@/services/product-rate';
import { PolicyRequestInputs } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import {
  buildCommonLogContext,
  LoggingFn,
} from '@/utils/logging/server-logging';
const currentFilePath = new URL(import.meta.url).pathname;

export default async function SelectAmountPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const commonLog = await buildCommonLogContext();

  logTrace('Page::policies::SelectAmountPage', {
    ...commonLog,
    file: currentFilePath,
    function: LoggingFn.SELECT_AMOUNT_PAGE,
  });

  const { data: policyDetails } = await getPolicyDetails(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    commonLog
  );

  const [policyStatusRes, ottpFeeRes, visibilityRes, featuresRes] =
    await Promise.allSettled([
      getPolicyStatusDetails(
        {
          planCode: params.planCode,
          policyNumber: params.policyNumber,
        },
        commonLog
      ),
      getCarrierProductOneTimePaymentFee({
        configuredItemCode:
          ConfiguredSettingId.ONE_TIME_PREMIUM_PAYMENT_GUAR_FEE,
        carrierId: policyDetails?.carrierId || '',
        planCode: planCode,
        benefitId: 'Base_Coverage',
      }),
      getComponentVisibility({ policyNumber, planCode }, commonLog),
      getPolicyFeatures(
        {
          planCode: params.planCode,
          policyNumber: params.policyNumber,
        },
        commonLog
      ),
    ]);

  const policyStatusDetails =
    policyStatusRes.status === 'fulfilled' ? policyStatusRes.value.data : null;
  const data = ottpFeeRes.status === 'fulfilled' ? ottpFeeRes.value.data : null;

  const visibility =
    visibilityRes.status === 'fulfilled' ? visibilityRes.value?.data : null;
  const features =
    featuresRes.status === 'fulfilled' ? featuresRes.value.data : null;

  const billingFeature = features?.data?.find(
    feature => feature.featureType === FeatureType.BILLING
  );

  // Depending on the policy, the amount field may be an input field or a read-only field
  const isAmountEditable =
    !!visibility?.[ComponentName.OTPP_EDITABLE_PAYMENT_AMOUNT]();
  const amountFromBillingFeature = billingFeature?.paymentAmount || 0;

  // If the amount is editable, we want to allow the user to enter the amount in the <SelectAmount /> form
  const amount = isAmountEditable ? undefined : amountFromBillingFeature;

  return (
    <OneTimePremium
      currentStepOverride={0}
      planCode={planCode}
      policyNumber={policyNumber}
    >
      <SelectAmount
        paymentFee={data?.fee || 0}
        paymentAmount={amount}
        isAmountEditable={isAmountEditable}
        minimumPaymentDue={
          policyStatusDetails?.policyStatus === PolicyStatus.PENDINGLAPSE &&
          policyStatusDetails?.minimumPaymentDue
            ? policyStatusDetails?.minimumPaymentDue
            : 0
        }
      />
    </OneTimePremium>
  );
}
