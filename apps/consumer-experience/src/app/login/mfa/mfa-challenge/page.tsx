import { redirect } from 'next/navigation';

import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { MfaChallengeOld } from '@/components/login/MfaChallengeOld';
import { CompanyName } from '@/types/carriers';
import { getCookie } from '@/utils/auth';
import { isVercelEnvironment } from '@/utils/environment';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

export default async function MfaChallengePage({
  searchParams,
}: {
  searchParams: { enrollment?: string; id?: string };
}) {
  const themeCookie = (await getCookie(THEME_COOKIE)) as CompanyName;

  if (!themeCookie && !isVercelEnvironment()) {
    redirect('/');
  }

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
