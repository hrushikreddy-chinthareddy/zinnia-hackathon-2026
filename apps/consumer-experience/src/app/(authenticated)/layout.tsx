import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import styles from '@/app/layout.module.css';
import { DesktopNav } from '@/components/desktop-nav/DesktopNav';
import { MobileNav } from '@/components/mobile-nav/MobileNav';
import { RefreshRouterManager } from '@/components/providers/RefreshRouterManager';
import { SessionManager } from '@/components/providers/SessionManager';
import { UserProvider } from '@/components/providers/UserProvider';
import { UserConsentManager } from '@/components/user-consent/UserConsentManager';
import { getSession } from '@/utils/auth';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    // TODO: eventually using whatever mechanism we decide to switch carriers, this carrier name will need to be dynamic
    template: '%s | Zinnia Tech',
    default: 'Policies',
  },
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <main className={`${styles.body} ${styles.main}`}>
      <UserProvider user={session?.user}>
        <SessionManager>
          <RefreshRouterManager>
            {/* To prevent hydration error by trying to render these dynamically using screen width,
          dynamically displaying using media queries */}
            <MobileNav />
            <DesktopNav />

            <div className={styles.container}>
              <div className={styles.content}>
                <UserConsentManager>{children}</UserConsentManager>
              </div>
            </div>
          </RefreshRouterManager>
        </SessionManager>
      </UserProvider>
    </main>
  );
}
