import { TaxWithholdings } from '@/components/workflows/surrender/forms/TaxWithholdings';
import Surrender from '@/components/workflows/surrender/Surrender';
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
  const preferredAddressIndicator =
    policyDetails?.data?.preferredAddressIndicator;
  let preferredAddress = undefined;
  let preferredAddressState = '';

  if (preferredAddressIndicator?.length) {
    preferredAddress = policyDetails?.data?.addresses?.find(
      address => address.addressId === preferredAddressIndicator
    );
  } else {
    preferredAddress = policyDetails?.data?.addresses[0];
  }
  if (preferredAddress?.state?.length) {
    preferredAddressState = preferredAddress.state;
  }
  return (
    <Surrender currentStepOverride={2}>
      <TaxWithholdings taxWithholdingState={preferredAddressState} />
    </Surrender>
  );
}
