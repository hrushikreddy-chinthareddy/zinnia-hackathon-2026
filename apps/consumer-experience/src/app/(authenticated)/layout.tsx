import type { Metadata } from 'next';

import styles from '@/app/layout.module.css';
import Analytics from '@/components/analytics/Analytics';
import { MourningBanner } from '@/components/mourning-banner/MourningBanner';
import { Nav } from '@/components/nav/Nav';
import { PiiProvider } from '@/components/providers/PiiProvider';
import { RefreshRouterManager } from '@/components/providers/RefreshRouterManager';
import { SessionManager } from '@/components/providers/SessionManager';
import { UserProvider } from '@/components/providers/UserProvider';
import { CompanyName } from '@/types/carriers';
import { getCookie, getSession } from '@/utils/auth';
import { THEME_COOKIE } from '@/utils/serverClientUtils';
import { UserConsentManager } from '@/components/user-consent/UserConsentManager';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: {
    template: '%s | MyPolicyView',
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
    <main>
      <UserProvider user={session?.user}>
        {/* As of May 22, 2024 we have not started phase 2 of masking PII data. This provider is setup for future use. Once we iron out the requirements around PII levels and data masking, we will populate this provider */}
        <PiiProvider
          pii={{
            pii: undefined,
            piiLevel: undefined,
          }}
        >
          <div style={{ width: '100%', backgroundColor: 'white' }}>
            <div className="layout-wrapper">
              <div className="layout-wrapper-inner">
                <Nav
                  planCode={params.planCode}
                  policyNumber={params.policyNumber}
                  userName={{
                    firstName: undefined,
                    lastName: undefined,
                  }}
                  themeCookie={themeCookie as CompanyName}
                />
              </div>
            </div>
          </div>

          <SessionManager>
            <RefreshRouterManager>
              <MourningBanner />
              <div className="layout-wrapper">
                <div className="layout-wrapper-inner">
                  <div className={styles.mainContent}>
                    <UserConsentManager>{children}</UserConsentManager>
                  </div>
                </div>
              </div>
              <Analytics />
            </RefreshRouterManager>
          </SessionManager>
        </PiiProvider>
      </UserProvider>
    </main>
  );
}
