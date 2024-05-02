import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaChallenge } from '@/components/login/MfaChallenge';

export default function MfaChallengePage({
  searchParams,
}: {
  searchParams: { enrollment?: string; id?: string };
}) {
  return (
    <GenericInfoPage
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
