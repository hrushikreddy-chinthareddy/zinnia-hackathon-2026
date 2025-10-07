import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { SurrenderProvider } from '@/components/stepped-workflow/workflows/surrender/provider/SurrenderProvider';
import { getPolicySurrenderEligibility } from '@/services/bpm/fullsurrender';
import { getFeatureFlagsWithCarrierConfig } from '@/services/feature-flags-carrier-config';
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
  const loggingContext = await buildCommonLogContext();

  const { planCode, policyNumber } = params;
  const { featureFlags: flags, carrierConfig } =
    await getFeatureFlagsWithCarrierConfig();

  const showSurrenderCta =
    !!flags?.[FEATURE_FLAGS.TRANSACTION_FULL_SURRENDER] &&
    carrierConfig?.account?.surrender?.enabled;

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
