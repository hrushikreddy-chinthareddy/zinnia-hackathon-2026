import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { PaymentSummary } from '@/components/one-time-premium-payment/payment-summary/PaymentSummary';
import { getPolicyAccountValue } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';

export default async function Summary({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data } = await getPolicyAccountValue({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return (
    <>
      <PaymentSummary
        policyNumber={policyNumber}
        planCode={planCode}
        lineOfBusiness={LineOfBusiness.ANNUITY}
        uncollectedCharges={data?.uncollectedCharges || 0}
      />
    </>
  );
}
