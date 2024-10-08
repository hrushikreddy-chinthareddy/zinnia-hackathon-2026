import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import styles from '@/app/layout.module.css';
import { Nav } from '@/components/nav/Nav';
import { PiiProvider } from '@/components/providers/PiiProvider';
import { RefreshRouterManager } from '@/components/providers/RefreshRouterManager';
import { SessionManager } from '@/components/providers/SessionManager';
import { UserProvider } from '@/components/providers/UserProvider';
import { UserConsentManager } from '@/components/user-consent/UserConsentManager';
import { getCookie, getSession } from '@/utils/auth';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

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
  params,
  children,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
  children: React.ReactNode;
}) {
  const session = await getSession();
  const themeCookie = await getCookie(THEME_COOKIE);
  // TODO: Eventually, the idToken currently returns the name as the user's email, until that is updated we are
  // passing in undefined and showing the user icon in the user badge
  // Requested in CIAM channel on 09/27/24 https://se2llc-global.slack.com/archives/C04QBKBJ3H7/p1727459783747249
  // const userName = session?.user?.name.split(' ');

  return (
    <main className={`${styles.body} ${styles.main}`} data-theme={themeCookie}>
      <UserProvider user={session?.user}>
        {/* As of May 22, 2024 we have not started phase 2 of masking PII data. This provider is setup for future use. Once we iron out the requirements around PII levels and data masking, we will populate this provider */}
        <PiiProvider
          pii={{
            pii: undefined,
            piiLevel: undefined,
          }}
        >
          <SessionManager>
            <RefreshRouterManager>
              <Nav
                planCode={params.planCode}
                policyNumber={params.policyNumber}
                userName={{
                  firstName: undefined,
                  lastName: undefined,
                }}
              />

              <div className={styles.container}>
                <div className={styles.content}>
                  <UserConsentManager>{children}</UserConsentManager>
                </div>
              </div>
            </RefreshRouterManager>
          </SessionManager>
        </PiiProvider>
      </UserProvider>
    </main>
  );
}
