import { PaymentSubmitted } from '@/components/one-time-premium-payment/PaymentSubmitted';
import { OneTimePremium } from '@/components/workflows/one-time-premium/OneTimePremium';
import { PolicyRequestInputs } from '@/types/policy';

export default async function SubmittedPayment({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  return (
    <OneTimePremium
      currentStepOverride={3}
      planCode={planCode}
      policyNumber={policyNumber}
    >
      <PaymentSubmitted />
    </OneTimePremium>
  );
}
