import { SelectBankWrapper } from '@/components/stepped-workflow/workflows/surrender/forms/SelectBankWrapper';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';
import { getPolicyProfileData } from '@/services';
import { getCarrierConfig } from '@/services/carrier-config';
import { getPaymentMethods } from '@/services/payment-methods';
import { PolicyRequestInputsParams } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

const BankPage = async ({ params }: PolicyRequestInputsParams) => {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const { data } = await getCarrierConfig(loggingContext);

  const { data: initialPaymentMethods } = await getPaymentMethods(
    {
      policyNumber,
      planCode,
    },
    loggingContext
  );

  const { data: policyData } = await getPolicyProfileData(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  const addresses = filterItemsWithPastEndDate(policyData?.addresses);

  return (
    <Surrender currentStepOverride={4}>
      <SelectBankWrapper
        policyNumber={policyNumber}
        planCode={planCode}
        initialPaymentMethods={initialPaymentMethods || []}
        lineOfBusiness={LineOfBusiness.LIFE}
        paymentProvider={data?.payment.provider}
        activeAddresses={addresses}
      />
    </Surrender>
  );
};

export default BankPage;
