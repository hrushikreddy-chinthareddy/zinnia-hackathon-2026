import { PaymentSummary } from '@/components/stepped-workflow/workflows/one-time-premium/forms/payment-summary/PaymentSummary';
import { OneTimePremium } from '@/components/stepped-workflow/workflows/one-time-premium/OneTimePremium';
import { getPolicyAccountValue } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

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
        lineOfBusiness={LineOfBusiness.LIFE}
        uncollectedCharges={data?.uncollectedCharges || 0}
      />
    </OneTimePremium>
  );
}
