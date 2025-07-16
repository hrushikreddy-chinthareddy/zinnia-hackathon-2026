import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { PaymentSummary } from '@/components/one-time-premium-payment/payment-summary/PaymentSummary';
import { OneTimePremium } from '@/components/workflows/one-time-premium/OneTimePremium';
import { getPolicyAccountValue } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function Summary({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const { data } = await getPolicyAccountValue(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  return (
    <OneTimePremium
      currentStepOverride={2}
      planCode={planCode}
      policyNumber={policyNumber}
    >
      <PaymentSummary
        policyNumber={policyNumber}
        planCode={planCode}
        lineOfBusiness={LineOfBusiness.ANNUITY}
        uncollectedCharges={data?.uncollectedCharges || 0}
      />
    </OneTimePremium>
  );
}
