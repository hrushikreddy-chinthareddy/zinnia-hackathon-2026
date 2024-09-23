import { EnterEmailStep } from '@/components/login/EnterEmailStep';
import { GenericLoginPage } from './GenericLoginPage';

export default function LoginPage() {
  return (
    <GenericLoginPage
      title="What’s your email?"
      description="Enter the email associated with your policy or contract, and we'll send you a verification code."
      action={<EnterEmailStep />}
    />
  );
}
