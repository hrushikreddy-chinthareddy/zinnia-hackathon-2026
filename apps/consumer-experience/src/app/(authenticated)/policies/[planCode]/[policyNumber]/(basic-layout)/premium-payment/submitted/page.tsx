import { PaymentSubmitted } from '@/components/one-time-premium-payment/PaymentSubmitted';
import { oneTimePremiumSteps } from '@/components/one-time-premium-payment/steps';
import { ProgressBarSteps } from '@/components/progress-bar-steps/ProgressBarSteps';
import { PolicyRequestInputs } from '@/types/policy';

export default async function SubmittedPayment({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  return (
    <>
      <ProgressBarSteps
        totalSteps={Object.keys(oneTimePremiumSteps).length}
        currentStep={
          Object.keys(oneTimePremiumSteps).findIndex(
            step => step === 'submitted'
          ) + 1
        }
        className="steps-progress-bar mb-xl"
        description="Step"
      />

      <PaymentSubmitted policyNumber={policyNumber} planCode={planCode} />
    </>
  );
}
