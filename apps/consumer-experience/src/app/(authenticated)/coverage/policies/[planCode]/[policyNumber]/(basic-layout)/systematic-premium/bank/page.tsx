import { SelectBank } from '@/components/workflows/systematic-premiums/forms/SelectBank';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';
import { getPaymentDetails, getPolicyProfileData } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const BankPage = async ({ params }: PolicyRequestInputsParams) => {
  const loggingContext = await buildCommonLogContext();

  const { data } = await getPaymentDetails(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  const { data: policyData } = await getPolicyProfileData(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  return (
    <SystematicPremiums currentStepOverride={1}>
      <SelectBank activeBanks={data || []} parties={policyData?.parties} />
    </SystematicPremiums>
  );
};

export default BankPage;
