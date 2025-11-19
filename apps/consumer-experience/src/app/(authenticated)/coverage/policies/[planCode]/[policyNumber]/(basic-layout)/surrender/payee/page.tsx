import { PayeeStep } from '@/components/stepped-workflow/workflows/surrender/forms/PayeeStep';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';
import { getPolicyProfileData } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { PartyRole } from '@zinnia/api-types/types/sor';

const PayeePage = async ({ params }: PolicyRequestInputsParams) => {
  const loggingContext = await buildCommonLogContext();
  const { data: profileData } = await getPolicyProfileData(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  const payees = profileData?.parties?.filter(party =>
    party.partyRoles?.includes(PartyRole.PAYEE)
  );
  return (
    <Surrender currentStepOverride={3}>
      <PayeeStep payees={payees} />
    </Surrender>
  );
};

export default PayeePage;
