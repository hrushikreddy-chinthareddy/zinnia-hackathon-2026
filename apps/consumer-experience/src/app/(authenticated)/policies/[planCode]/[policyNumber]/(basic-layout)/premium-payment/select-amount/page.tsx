import { HeaderLink } from '@/components/header-link/HeaderLink';
import { SelectAmount } from '@/components/one-time-premium-payment/SelectAmount';
import { oneTimePremiumSteps } from '@/components/one-time-premium-payment/steps';
import { ProgressBarSteps } from '@/components/progress-bar-steps/ProgressBarSteps';
import {
  ConfiguredSettingId,
  getCarrierProductOneTimePaymentFee,
} from '@/services/product-rate';
import { PolicyRequestInputs } from '@/types/policy';

export default async function SelectBankPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data } = await getCarrierProductOneTimePaymentFee({
    configuredItemCode: ConfiguredSettingId.ONE_TIME_PREMIUM_PAYMENT_GUAR_FEE,
    carrierId: 'SBUL',
    planCode: planCode,
    benefitId: 'Base_Coverage',
  });

  return (
    <>
      <HeaderLink
        className="mb-xl"
        title={oneTimePremiumSteps.amount.title}
        link={{
          url: `/policies/${planCode}/${policyNumber}/premium`,
          label: 'return to payment page',
        }}
      />
      <ProgressBarSteps
        totalSteps={Object.keys(oneTimePremiumSteps).length}
        currentStep={
          Object.keys(oneTimePremiumSteps).findIndex(
            step => step === 'amount'
          ) + 1
        }
        // TODO: fix this
        className="steps-progress-bar mb-xl"
        description="Step"
      />
      <SelectAmount
        policyNumber={policyNumber}
        planCode={planCode}
        paymentFee={data?.fee || 0}
      />
    </>
  );
}
