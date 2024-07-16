import { redirect } from 'next/navigation';

import { OneTimePremiumPayment } from '@/components/one-time-premium-payment/OneTimePremiumPayment';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function PremiumPaymentPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const featureFlagDecisions = await getFeatureFlags();
  if (!featureFlagDecisions?.[FEATURE_FLAGS.ONE_TIME_PREMIUM_PAYMENT]) {
    // TODO: this isn't great because there's a significant flash before redirect happens
    // do we have to do redirect in middleware which means feature flags in middleware?
    redirect('/not-found');
  }

  return (
    <div>
      <OneTimePremiumPayment {...params} />
    </div>
  );
}
