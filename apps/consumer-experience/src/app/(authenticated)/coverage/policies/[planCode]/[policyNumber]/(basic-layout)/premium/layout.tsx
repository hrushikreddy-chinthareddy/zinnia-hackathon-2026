import { redirect } from 'next/navigation';

import { OttpProvider } from '@/components/providers/one-time-premium-payment/OttpProvider';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function PremiumPaymentPage({
  children,
}: {
  params: PolicyRequestInputs;
  children: any;
}) {
  const featureFlagDecisions = await getFeatureFlags();
  if (!featureFlagDecisions?.[FEATURE_FLAGS.ONE_TIME_PREMIUM_PAYMENT]) {
    // TODO: this isn't great because there's a significant flash before redirect happens
    // do we have to do redirect in middleware which means feature flags in middleware?
    redirect('/not-found');
  }

  return (
    <div>
      <OttpProvider>
        <div>{children}</div>
      </OttpProvider>
    </div>
  );
}
