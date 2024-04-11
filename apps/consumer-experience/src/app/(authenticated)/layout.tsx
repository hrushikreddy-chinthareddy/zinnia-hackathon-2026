import { UserProvider } from '@auth0/nextjs-auth0/client';

import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import styles from '@/app/layout.module.css';
import { DesktopNav } from '@/components/desktop-nav/DesktopNav';
import { MobileNav } from '@/components/mobile-nav/MobileNav';
import { PolicyStatusAlertBanner } from '@/components/policy-status-alert-banner/PolicyStatusAlertBanner';
import { SessionManager } from '@/components/session/SessionManager';
import { PolicyRequestInputs } from '@/types/policy';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Consumer UI',
  description: 'Consumer UI',
};

export default async function AuthenticatedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  console.log(params.planCode);

  return (
    <UserProvider>
      <main className={`${styles.body} ${styles.main}`}>
        <SessionManager>
          {/* To prevent hydration error by trying to render these dynamically using screen width,
          dynamically displaying using media queries */}
          <MobileNav />
          <DesktopNav />
          <div className={styles.container}>
            <div className={styles.content}>
              <>
                <PolicyStatusAlertBanner />
                {children}
              </>
            </div>
          </div>
        </SessionManager>
      </main>
    </UserProvider>
  );
}
