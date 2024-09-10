import { Link } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { Footer } from '@/components/footer/Footer';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Welcome | Zinnia Tech',
};

export default async function WelcomePage() {
  // TODO: remove this comment after testing push
  return (
    <GenericInfoPage
      title="Welcome!"
      description="Access your policies in the policy portal—no password needed."
      action={
        <Link
          href="/login"
          text="Sign in"
          variant="button"
          className="mt-3xl mx-auto"
          expand
        />
      }
      footer={<Footer />}
    />
  );
}
