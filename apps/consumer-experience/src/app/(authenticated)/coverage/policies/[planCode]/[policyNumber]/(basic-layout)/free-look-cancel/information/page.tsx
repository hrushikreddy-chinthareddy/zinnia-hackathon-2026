import { notFound } from 'next/navigation';

import { getCarrierConfig } from '@/services/carrier-config';
import { getFeatureFlags } from '@/services/feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function FreeLookCancelInformation() {
  const flags = await getFeatureFlags();
  const carrierConfig = await getCarrierConfig();

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
