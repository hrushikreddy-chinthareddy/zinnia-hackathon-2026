import { MfaEnrollment } from '@/components/login/MfaEnrollment';
import { GenericLoginPage } from '../../GenericLoginPage';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { getFeatureFlags } from '@/services/feature-flags';

export default async function MfaEnrollmentPage() {
  const featureFlagDecisions = await getFeatureFlags();

  if (!featureFlagDecisions[FEATURE_FLAGS.ANNUITY_MODE]) {
    return (
      <GenericInfoPage
        title="Let’s secure your account."
        description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
        action={<MfaEnrollment />}
      />
    );
  }

  return (
    <GenericLoginPage
      title="Let’s secure your account."
      description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
      action={<MfaEnrollment />}
    />
  );
}
