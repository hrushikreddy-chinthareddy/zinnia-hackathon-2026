import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';

import { SelectBank } from '@/components/workflows/withdrawals/forms/SelectBank';
import { Withdrawals } from '@/components/workflows/withdrawals/Withdrawals';
import { getPaymentDetails, getPolicyProfileData } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const BankPage = async ({ params }: PolicyRequestInputsParams) => {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();

  const { data } = await getPaymentDetails(
    {
      planCode,
      policyNumber,
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
    <Withdrawals
      planCode={params.planCode}
      policyNumber={params.planCode}
      currentStepOverride={5}
    >
      <SelectBank
        activeAddresses={addresses}
        activeBanks={data || []}
        parties={policyData?.parties}
        lineOfBusiness={LineOfBusiness.ANNUITY}
      />
    </Withdrawals>
  );
};

export default BankPage;
