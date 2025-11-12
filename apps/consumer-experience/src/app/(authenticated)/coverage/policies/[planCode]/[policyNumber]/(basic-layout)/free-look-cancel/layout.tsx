import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { FreeLookCancelProvider } from '@/components/stepped-workflow/workflows/free-look-cancel/provider/FreeLookCancelProvider';
import { getFreeLookCancellationEligibility } from '@/services/bpm/free-look-cancel';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function FreeLookCancelFlow({
  params,
  children,
}: {
  params: PolicyRequestInputs;
  children: ReactNode;
}) {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const flags = await getFeatureFlags();

  const showSurrenderCta = flags?.[FEATURE_FLAGS.TRANSACTION_FREE_LOOK_CANCEL];

  const { data: eligibility } = await getFreeLookCancellationEligibility(
    { planCode, policyNumber },
    loggingContext
  );

  if (!showSurrenderCta || !eligibility?.isEligible) {
    redirect(`/coverage/policies/${planCode}/${policyNumber}/`);
  }

  return (
    <FreeLookCancelProvider>
      <div>{children}</div>
    </FreeLookCancelProvider>
  );
}
