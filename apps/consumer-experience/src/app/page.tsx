import { Link } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Footer } from '@/components/footer/Footer';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { getSession } from '@/utils/auth';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Welcome | Zinnia Tech',
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
      footer={<Footer />}
    />
  );
}
