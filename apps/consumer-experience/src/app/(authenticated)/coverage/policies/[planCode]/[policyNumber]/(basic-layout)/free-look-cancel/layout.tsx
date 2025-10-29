import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { FreeLookCancelProvider } from '@/components/stepped-workflow/workflows/free-look-cancel/provider/FreeLookCancelProvider';
import { getFeatureFlagsWithCarrierConfig } from '@/services/feature-flags-carrier-config';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function FreeLookCancelFlow({
  params,
  children,
}: {
  params: PolicyRequestInputs;
  children: ReactNode;
}) {
  const { planCode, policyNumber } = params;
  const { featureFlags: flags, carrierConfig } =
    await getFeatureFlagsWithCarrierConfig();

  const showSurrenderCta =
    flags?.[FEATURE_FLAGS.TRANSACTION_FREE_LOOK_CANCEL] ||
    carrierConfig?.freeLookCancel?.enabled;

  // TODO: add checking eligibility here
  if (!showSurrenderCta) {
    redirect(`/coverage/policies/${planCode}/${policyNumber}/`);
  }

  return (
    <FreeLookCancelProvider>
      <div>{children}</div>
    </FreeLookCancelProvider>
  );
}
