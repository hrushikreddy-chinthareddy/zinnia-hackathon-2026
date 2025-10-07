import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { SelectBankWrapper } from '@/components/stepped-workflow/workflows/one-time-premium/forms/select-bank/SelectBankWrapper';
import { OneTimePremium } from '@/components/stepped-workflow/workflows/one-time-premium/OneTimePremium';
import { getCarrierConfig } from '@/services/carrier-config';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function SelectBankPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const commonLoggingContext = await buildCommonLogContext();
  const { data } = await getCarrierConfig(commonLoggingContext);

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
        paymentProvider={data?.payment.provider}
      />
    </OneTimePremium>
  );
}
