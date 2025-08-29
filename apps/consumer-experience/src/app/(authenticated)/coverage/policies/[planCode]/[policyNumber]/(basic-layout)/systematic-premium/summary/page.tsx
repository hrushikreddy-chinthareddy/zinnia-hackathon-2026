import { PartyRole } from '@xd/api-types/dist/generated-types/bpm';

import { SummaryForm } from '@/components/workflows/systematic-premiums/forms/Summary/SummaryForm';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';
import { getPolicyProfileData } from '@/services';
import { getPaymentMethods } from '@/services/payment-methods';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const SummaryPage = async ({ params }: PolicyRequestInputsParams) => {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const [paymentMethodData, profileData] = await Promise.allSettled([
    await getPaymentMethods(
      {
        policyNumber,
        planCode,
      },
      loggingContext
    ),
    await getPolicyProfileData(
      {
        planCode,
        policyNumber,
      },
      loggingContext
    ),
  ]);

  if (
    paymentMethodData.status === 'rejected' ||
    profileData.status === 'rejected'
  ) {
    return null;
  }

  let payors;
  let paymentMethods;

  if (paymentMethodData.status === 'fulfilled') {
    paymentMethods = paymentMethodData.value.data;
  }

  if (profileData.status === 'fulfilled') {
    payors = profileData.value.data?.parties?.filter(party =>
      party.partyRoles?.includes(PartyRole.PAYOR)
    );
  }

  if (!payors || !paymentMethods) {
    return null;
  }

  return (
    <SystematicPremiums currentStepOverride={2}>
      <SummaryForm payors={payors} paymentMethods={paymentMethods} />
    </SystematicPremiums>
  );
};

export default SummaryPage;
