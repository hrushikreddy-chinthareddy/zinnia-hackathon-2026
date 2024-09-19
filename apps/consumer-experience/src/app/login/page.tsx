import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { EnterEmailStep } from '@/components/login/EnterEmailStep';

export default function LoginPage() {
  return (
    <GenericInfoPage
      title="What’s your email?"
      description="Enter the email associated with your policy or contract, and we'll send you a verification code."
      action={<EnterEmailStep />}
    />
  );
}
