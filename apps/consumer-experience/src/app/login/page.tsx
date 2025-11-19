import { redirect } from 'next/navigation';

import { EnterEmailStep } from '@/components/login/EnterEmailStep';
import { CompanyName } from '@/types/carriers';
import { getCookie } from '@/utils/auth';
import { isVercelEnvironment } from '@/utils/environment';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

import { GenericLoginPage } from './GenericLoginPage';

export default async function LoginPage() {
  const themeCookie = (await getCookie(THEME_COOKIE)) as CompanyName;

  if (!themeCookie && !isVercelEnvironment()) {
    redirect('/');
  }

  return (
    <GenericLoginPage
      title="What’s your email?"
      description="Enter the email associated with your policy or contract, and we'll send you a verification code."
      action={<EnterEmailStep />}
    />
  );
}
