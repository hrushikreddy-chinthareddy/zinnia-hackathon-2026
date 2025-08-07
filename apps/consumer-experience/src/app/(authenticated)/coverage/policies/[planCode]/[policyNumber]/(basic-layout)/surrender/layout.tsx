import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { SurrenderProvider } from '@/components/providers/surrender/SurrenderProvider';
import { getPolicySurrenderEligibility } from '@/services/bpm/fullsurrender';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function SurrenderFlow({
  params,
  children,
}: {
  params: PolicyRequestInputs;
  children: ReactNode;
}) {
  const flags = await getFeatureFlags();
  const loggingContext = await buildCommonLogContext();

  const { planCode, policyNumber } = params;

  const showSurrenderCta = !!flags?.[FEATURE_FLAGS.TRANSACTION_FULL_SURRENDER];

  let isEligibleForSurrender = false;
  if (showSurrenderCta) {
    const { data: surrenderEligibility } = await getPolicySurrenderEligibility(
      planCode,
      policyNumber,
      loggingContext
    );

    isEligibleForSurrender = !!surrenderEligibility?.isEligible;
  }

  // If the surrender feature flag is off or if the user is not eligible to surrender the policy
  // redirect them to the policy overview page
  if (!showSurrenderCta || !isEligibleForSurrender) {
    redirect(`/coverage/policies/${planCode}/${policyNumber}/`);
  }
  return (
    <SurrenderProvider>
      <div>{children}</div>
    </SurrenderProvider>
  );
}
