import { LineOfBusiness } from '@xd/api-types/dist/generated-types/bpm';

import { SelectBankWrapper } from '@/components/workflows/systematic-premiums/forms/SelectBankWrapper';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';
import { getCarrierConfig } from '@/services/carrier-config';
import { getPaymentMethods } from '@/services/payment-methods';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const BankPage = async ({ params }: PolicyRequestInputsParams) => {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const { payment } = await getCarrierConfig();

  const { data: initialPaymentMethods } = await getPaymentMethods(
    {
      policyNumber,
      planCode,
    },
    loggingContext
  );

  return (
    <SystematicPremiums currentStepOverride={1}>
      <SelectBankWrapper
        policyNumber={policyNumber}
        planCode={planCode}
        initialPaymentMethods={initialPaymentMethods || []}
        lineOfBusiness={LineOfBusiness.LIFE}
        paymentProvider={payment.provider}
      />
    </SystematicPremiums>
  );
};

export default BankPage;
