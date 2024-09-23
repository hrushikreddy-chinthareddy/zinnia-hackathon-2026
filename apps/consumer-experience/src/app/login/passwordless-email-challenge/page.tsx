import { PasswordlessEmailChallenge } from '@/components/login/PasswordlessEmailChallenge';
import { GenericLoginPage } from '../GenericLoginPage';

export default function PasswordlessEmailChallengePage({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  return (
    <GenericLoginPage
      title="Enter your code."
      description="Check for an email from us with your 6-digit verification code."
      action={<PasswordlessEmailChallenge email={searchParams.email} />}
    />
  );
}
