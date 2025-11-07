import { PartyRole } from '@xd/api-types/dist/generated-types/sor';
import { notFound } from 'next/navigation';

import { SelectPayee } from '@/components/stepped-workflow/workflows/free-look-cancel/forms/SelectPayee';
import { getFeatureFlags } from '@/services/feature-flags';
import { getPolicyProfileData } from '@/services/policy';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function FreeLookCancelInformation({
  params,
}: PolicyRequestInputsParams) {
  const flags = await getFeatureFlags();

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

  if (!flags?.[FEATURE_FLAGS.TRANSACTION_FREE_LOOK_CANCEL]) {
    notFound();
  }

  return <SelectPayee payees={payees || []} />;
}
