import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaEnrollment } from '@/components/login/MfaEnrollment';

export default function MfaEnrollmentPage() {
  return (
    <GenericInfoPage
      title="Let’s secure your account."
      description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
      action={<MfaEnrollment />}
    />
  );
}
