import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaChallengeOld } from '@/components/login/MfaChallengeOld';

export default async function MfaChallengePage({
  searchParams,
}: {
  searchParams: { enrollment?: string; id?: string };
}) {
  return (
    <GenericInfoPage
      title="Enter your code."
      description="Enter your 6-digit verification code."
      action={
        <MfaChallengeOld
          enrollment={searchParams.enrollment}
          id={searchParams.id}
        />
      }
    />
  );
}
