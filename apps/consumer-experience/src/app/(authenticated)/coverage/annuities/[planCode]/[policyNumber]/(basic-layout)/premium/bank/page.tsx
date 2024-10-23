import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { SelectBank } from '@/components/one-time-premium-payment/select-bank/SelectBank';
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
      <SelectBank
        policyNumber={policyNumber}
        planCode={planCode}
        activeBanks={data || []}
        lineOfBusiness={LineOfBusiness.ANNUITY}
      />
    </>
  );
}
