import { redirect } from 'next/navigation';

import { MfaEnrollment } from '@/components/login/MfaEnrollment';
import { CompanyName } from '@/types/carriers';
import { getCookie } from '@/utils/auth';
import { isVercelEnvironment } from '@/utils/environment';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

import { GenericLoginPage } from '../../GenericLoginPage';

export default async function MfaEnrollmentPage() {
  const themeCookie = (await getCookie(THEME_COOKIE)) as CompanyName;

  if (!themeCookie && !isVercelEnvironment()) {
    redirect('/');
  }

  return (
    <GenericLoginPage
      title="Let’s secure your account."
      description="Enter a phone number where we can send another verification code. (This will help us secure your account.)"
      action={<MfaEnrollment />}
    />
  );
}
