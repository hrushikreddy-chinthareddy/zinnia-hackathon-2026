import { PayeeStep } from '@/components/stepped-workflow/workflows/withdrawals/forms/PayeeStep';
import { Withdrawals } from '@/components/stepped-workflow/workflows/withdrawals/Withdrawals';
import { getPolicyProfileData } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { PartyRole } from '@zinnia/api-types/types/sor';

const PayeePage = async ({ params }: PolicyRequestInputsParams) => {
  const loggingContext = await buildCommonLogContext();
  const { data: profileData } = await getPolicyProfileData(
    {
      planCode: params.planCode, // Replace with actual plan code
      policyNumber: params.policyNumber, // Replace with actual policy number
    },
    loggingContext
  );

  const payees = profileData?.parties?.filter(party =>
    party.partyRoles?.includes(PartyRole.PAYEE)
  );
  return (
    <Withdrawals
      planCode={params.planCode}
      policyNumber={params.policyNumber}
      currentStepOverride={4}
    >
      <PayeeStep payees={payees} />
    </Withdrawals>
  );
};

export default PayeePage;
