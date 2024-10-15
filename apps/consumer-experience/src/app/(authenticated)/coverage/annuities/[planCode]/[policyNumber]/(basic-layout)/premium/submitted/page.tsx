import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { PaymentSubmitted } from '@/components/one-time-premium-payment/PaymentSubmitted';
import { PolicyRequestInputs } from '@/types/policy';

export default async function SubmittedPayment({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  return (
    <>
      <PaymentSubmitted
        policyNumber={policyNumber}
        planCode={planCode}
        lineOfBusiness={LineOfBusiness.ANNUITY}
      />
    </>
  );
}
