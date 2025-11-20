import { redirect } from 'next/navigation';

import { PasswordlessEmailChallenge } from '@/components/login/PasswordlessEmailChallenge';
import { CompanyName } from '@/types/carriers';
import { getCookie } from '@/utils/auth';
import { isVercelEnvironment } from '@/utils/environment';
import {
  LOGIN_EMAIL_COOKIE_KEY,
  THEME_COOKIE,
} from '@/utils/serverClientUtils';

import { GenericLoginPage } from '../GenericLoginPage';

export default async function PasswordlessEmailChallengePage() {
  const themeCookie = (await getCookie(THEME_COOKIE)) as CompanyName;

  if (!themeCookie && !isVercelEnvironment()) {
    redirect('/');
  }

  // This is to protect against the edge case where a user has this step saved in their
  // history and are trying to login but have not yet entered their email
  // we don't want to show a blank email field on the enter a code page
  const userEmailCookie = await getCookie(LOGIN_EMAIL_COOKIE_KEY);
  if (!userEmailCookie) {
    return redirect('/login');
  }

  return (
    <GenericLoginPage
      title="Enter your code."
      description="Check for an email from us with your 6-digit verification code."
      action={<PasswordlessEmailChallenge />}
    />
  );
}
