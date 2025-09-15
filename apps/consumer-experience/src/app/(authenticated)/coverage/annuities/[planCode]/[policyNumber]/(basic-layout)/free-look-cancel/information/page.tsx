import { notFound } from 'next/navigation';

import { getFeatureFlagsWithCarrierConfig } from '@/services/feature-flags-carrier-config';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function FreeLookCancelInformation() {
  const { featureFlags: flags, carrierConfig } =
    await getFeatureFlagsWithCarrierConfig();

  if (
    !flags?.[FEATURE_FLAGS.TRANSACTION_FREE_LOOK_CANCEL] ||
    !carrierConfig?.freeLookCancel?.enabled
  ) {
    notFound();
  }

  return (
    <div>
      <h1>Are you sure you want to cancel? </h1>
    </div>
  );
}
