import { HeaderLink } from '@/components/header-link/HeaderLink';
import { SelectBank } from '@/components/one-time-premium-payment/SelectBank';
import { oneTimePremiumSteps } from '@/components/one-time-premium-payment/steps';
import { ProgressBarSteps } from '@/components/progress-bar-steps/ProgressBarSteps';
import { getPaymentDetails } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';

export default async function SelectBankPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data } = await getPaymentDetails({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return (
    <>
      <HeaderLink
        className="mb-xl"
        title={oneTimePremiumSteps.bank.title}
        link={{
          // TODO: use an object or something instead of hard coding
          url: `/policies/${planCode}/${policyNumber}/premium-payment/select-amount`,
          label: 'return to select amount',
        }}
      />
      <ProgressBarSteps
        totalSteps={Object.keys(oneTimePremiumSteps).length}
        currentStep={
          Object.keys(oneTimePremiumSteps).findIndex(step => step === 'bank') +
          1
        }
        className="steps-progress-bar mb-xl"
        description="Step"
      />
      <SelectBank
        policyNumber={policyNumber}
        planCode={planCode}
        activeBanks={data || []}
      />
    </>
  );
}
