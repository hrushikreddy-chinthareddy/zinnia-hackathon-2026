import { MfaEnrollment } from '@/components/login/MfaEnrollment';
import { GenericLoginPage } from '../../GenericLoginPage';

export default function MfaEnrollmentPage() {
  return (
    <GenericLoginPage
      title="Let’s secure your account."
      description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
      action={<MfaEnrollment />}
    />
  );
}
