import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import styles from '@/app/layout.module.css';
import Analytics from '@/components/analytics/Analytics';
import { Nav } from '@/components/nav/Nav';
import { PiiProvider } from '@/components/providers/PiiProvider';
import { RefreshRouterManager } from '@/components/providers/RefreshRouterManager';
import { SessionManager } from '@/components/providers/SessionManager';
import { UserProvider } from '@/components/providers/UserProvider';
import { UserConsentManager } from '@/components/user-consent/UserConsentManager';
import { CompanyName } from '@/types/carriers';
import { getCookie, getSession } from '@/utils/auth';
import { THEME_COOKIE } from '@/utils/serverClientUtils';

import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';

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

  const showPresidentialMourningBanner = () => {
    const today = dayjs();
    return false;
    // return today.isBetween('2025-01-08', '2025-01-10', 'day', '[]');
  };

  return (
    <main data-theme={themeCookie}>
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
                themeCookie={themeCookie as CompanyName}
              />

              <div className={styles.container}>
                <div className={styles.content}>
                  {showPresidentialMourningBanner() && (
                    <BannerAlert
                      className="mb-lg"
                      bodyText="In recognition of the National Day of Mourning following the death of former President Jimmy Carter, the stock market will be closed on January 9, 2025.  As a result, contract values are as of close of business January 8, 2025.  Any trades or other financial transactions submitted on January 9, 2025 will be processed when the stock market reopens on January 10, 2025."
                      variant={BannerVariant.Warning}
                    />
                  )}
                  <UserConsentManager>{children}</UserConsentManager>
                  <Analytics />
                </div>
              </div>
            </RefreshRouterManager>
          </SessionManager>
        </PiiProvider>
      </UserProvider>
    </main>
  );
}
