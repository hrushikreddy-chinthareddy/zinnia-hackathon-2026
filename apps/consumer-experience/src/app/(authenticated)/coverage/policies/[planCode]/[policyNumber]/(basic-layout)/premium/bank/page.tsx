import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { SelectBankWrapper } from '@/components/one-time-premium-payment/select-bank/SelectBankWrapper';
import { OneTimePremium } from '@/components/workflows/one-time-premium/OneTimePremium';
import { getCarrierConfig } from '@/services/carrier-config';
import { PolicyRequestInputs } from '@/types/policy';

export default async function SelectBankPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { payment } = await getCarrierConfig();

  return (
    <OneTimePremium
      currentStepOverride={1}
      planCode={planCode}
      policyNumber={policyNumber}
    >
      <SelectBankWrapper
        policyNumber={policyNumber}
        planCode={planCode}
        lineOfBusiness={LineOfBusiness.LIFE}
        paymentProvider={payment.provider}
      />
    </OneTimePremium>
  );
}
