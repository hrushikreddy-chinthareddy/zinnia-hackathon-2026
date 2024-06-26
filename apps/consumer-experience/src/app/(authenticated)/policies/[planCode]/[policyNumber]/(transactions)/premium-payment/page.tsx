import { PolicyRequestInputs } from '@/types/policy';
import { getSession } from '@/utils/auth';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { getFeatureFlagDecisions } from '@/utils/optimizely/optimizely';
import { redirect } from 'next/navigation';
import { OneTimePremiumPayment } from '@/components/one-time-premium-payment/OneTimePremiumPayment';

export default async function PremiumPaymentPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const session = await getSession();
  const userId = session?.user?.sub;

  const featureFlagDecisions = await getFeatureFlagDecisions(userId);

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
