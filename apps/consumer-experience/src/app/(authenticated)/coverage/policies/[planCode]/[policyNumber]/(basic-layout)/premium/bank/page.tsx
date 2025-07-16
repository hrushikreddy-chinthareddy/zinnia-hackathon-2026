import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { SelectBankWrapper } from '@/components/one-time-premium-payment/select-bank/SelectBankWrapper';
import { OneTimePremium } from '@/components/workflows/one-time-premium/OneTimePremium';
import { getCarrierConfig } from '@/services/carrier-config';
import { getPaymentMethods } from '@/services/payment-methods';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function SelectBankPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const { payment } = await getCarrierConfig();

  const { data: initialPaymentMethods } = await getPaymentMethods(
    {
      policyNumber,
      planCode,
      paymentProvider: payment.provider,
    },
    loggingContext
  );

  return (
    <OneTimePremium
      currentStepOverride={1}
      planCode={planCode}
      policyNumber={policyNumber}
    >
      <SelectBankWrapper
        policyNumber={policyNumber}
        planCode={planCode}
        initialPaymentMethods={initialPaymentMethods || []}
        lineOfBusiness={LineOfBusiness.LIFE}
        paymentProvider={payment.provider}
      />
    </OneTimePremium>
  );
}
