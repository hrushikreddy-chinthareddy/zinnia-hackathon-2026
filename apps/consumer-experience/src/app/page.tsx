import { Link } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { getSession } from '@/utils/auth';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Welcome page',
};

export default async function WelcomePage() {
  const session = await getSession();

  if (session) {
    return redirect('/policies');
  }

  return (
    <GenericInfoPage
      title="Welcome!"
      description="Access your coverage easily and securely in Zinnia Tech’s policy management portal—no password needed."
      action={
        <Link
          href="/login"
          text="Sign in"
          variant="button"
          className="mt-3xl mx-auto"
        />
      }
      footer={
        <>
          <p>
            You are receiving this message to keep you updated on your Everly
            account. Together we are committed to designing tools that give you
            more control over your account details and preferences. Learn more
            about Zinnia at zinnia.com.
          </p>
          <p>
            We care about your privacy. Learn more about the Everly privacy
            policy. To customize your notifications, you can manage your
            preferences or unsubscribe.
          </p>
          <p>© 2024 Zinnia 600 Steamboat Road Greenwich, CT 06830</p>
        </>
      }
    />
  );
}
