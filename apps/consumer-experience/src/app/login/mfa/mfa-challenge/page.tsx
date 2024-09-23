import { MfaChallenge } from '@/components/login/MfaChallenge';
import { GenericLoginPage } from '../../GenericLoginPage';

export default function MfaChallengePage({
  searchParams,
}: {
  searchParams: { enrollment?: string; id?: string };
}) {
  return (
    <GenericLoginPage
      title="Enter your code."
      description="Enter your 6-digit verification code."
      action={
        <MfaChallenge
          enrollment={searchParams.enrollment}
          id={searchParams.id}
        />
      }
    />
  );
}
