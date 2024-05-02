import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { PasswordlessEmailChallenge } from '@/components/login/PasswordlessEmailChallenge';

export default function PasswordlessEmailChallengePage({
  searchParams,
}: {
  searchParams: { email: string };
}) {
  return (
    <GenericInfoPage
      title="Enter your code."
      description="Check for an email from us with your 6-digit verification code."
      action={<PasswordlessEmailChallenge email={searchParams.email} />}
    />
  );
}
