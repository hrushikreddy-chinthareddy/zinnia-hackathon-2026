import { TaxWithholdings } from '@/components/stepped-workflow/workflows/surrender/forms/TaxWithholdings';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';
import { getPolicyProfileData } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function TaxWithholdingsPage({
  params,
}: PolicyRequestInputsParams) {
  const loggingContext = await buildCommonLogContext();
  const policyDetails = await getPolicyProfileData(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  const preferredAddress =
    policyDetails?.data?.addresses?.find(address => address.isPreferred) ||
    policyDetails?.data?.addresses[0];
  const preferredAddressState = preferredAddress?.state;

  return (
    <Surrender currentStepOverride={2}>
      <TaxWithholdings taxWithholdingState={preferredAddressState} />
    </Surrender>
  );
}
