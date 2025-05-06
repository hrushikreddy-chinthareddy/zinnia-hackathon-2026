import { Metadata } from 'next';

import loginStyles from '@/app/login/Login.module.css';
import { Footer } from '@/components/footer/Footer';
import { GenericInfoPage } from '@/components/generic-info-page/GenericInfoPage';
import { Link } from '@/components/link/Link';
import { MyPolicyViewLogo } from '@/components/my-policy-view-logo/MyPolicyViewLogo';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Welcome | MyPolicyView',
};

export default async function WelcomePage() {
  return (
    <GenericInfoPage
      title="Welcome!"
      description="Access your coverage in the portal—no password needed."
      action={
        <>
          <Link
            href="/login"
            text="Sign in"
            variant="button"
            className="mt-3xl mx-auto"
            expand
          />
          <MyPolicyViewLogo
            className={loginStyles.policyViewLogo}
            style={{ display: 'flex', justifyContent: 'center' }}
          />
        </>
      }
      footer={<Footer />}
    />
  );
}
