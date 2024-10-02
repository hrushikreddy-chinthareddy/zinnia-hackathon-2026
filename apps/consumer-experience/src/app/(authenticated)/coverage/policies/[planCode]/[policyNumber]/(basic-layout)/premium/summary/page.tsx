import { PaymentSummary } from '@/components/one-time-premium-payment/payment-summary/PaymentSummary';
import { PolicyRequestInputs } from '@/types/policy';

export default async function Summary({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  return (
    <>
      <PaymentSummary policyNumber={policyNumber} planCode={planCode} />
    </>
  );
}
