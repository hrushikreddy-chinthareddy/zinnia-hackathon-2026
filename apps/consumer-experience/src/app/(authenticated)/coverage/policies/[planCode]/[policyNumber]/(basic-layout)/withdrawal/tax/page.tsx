import { TaxWithholdings } from '@/components/stepped-workflow/workflows/withdrawals/forms/TaxWithholdings';
import { Withdrawals } from '@/components/stepped-workflow/workflows/withdrawals/Withdrawals';
import { getPolicyProfileData } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const TaxPage = async ({ params }: PolicyRequestInputsParams) => {
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
    <>
      <Withdrawals
        planCode={params.planCode}
        policyNumber={params.policyNumber}
        currentStepOverride={3}
      >
        <TaxWithholdings taxWithholdingState={preferredAddressState} />
      </Withdrawals>
    </>
  );
};

export default TaxPage;
