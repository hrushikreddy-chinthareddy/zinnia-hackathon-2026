import { getSession } from '@auth0/nextjs-auth0';
import { Link } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Login page',
};

export default async function Login() {
  const session = await getSession();

  if (session) {
    return redirect('/policies');
  }

  return (
    <GenericInfoPage
      title="Let's get you signed in."
      description="Access your coverage easily and securely by signing in with a verification code."
      action={
        <Link
          href="/api/auth/login"
          text="Get code"
          variant="button"
          style={{ width: '100%' }}
        />
      }
      footer={
        <>
          <p className="mb-lg">
            You are receiving this message to keep you updated on your Everly
            account. Together we are committed to designing tools that give you
            more control over your account details and preferences. Learn more
            about Zinnia at zinnia.com.
          </p>
          <p className="mb-lg">
            We care about your privacy. Learn more about the Everly privacy
            policy. To customize your notifications, you can manage your
            preferences or unsubscribe.
          </p>
          <p>© 2024 Zinnia 5801 SW Sixth Ave. Topeka, KS 66636</p>
        </>
      }
    />
  );
}
