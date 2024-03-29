import { UserProvider } from '@auth0/nextjs-auth0/client';

import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import styles from '@/app/layout.module.css';
import { DesktopNav } from '@/components/desktop-nav/DesktopNav';
import { Footer } from '@/components/footer/Footer';
import { MobileNav } from '@/components/mobile-nav/MobileNav';
import { SessionManager } from '@/components/session/SessionManager';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Consumer UI',
  description: 'Consumer UI',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <main className={`${styles.body} ${styles.main}`}>
        <SessionManager>
          {/* To prevent hydration error by trying to render these dynamically using screen width,
          dynamically displaying using media queries */}
          <MobileNav />
          <DesktopNav />
          <div className={styles.container}>
            <div className={styles.content}>{children}</div>
          </div>
        </SessionManager>
      </main>
    </UserProvider>
  );
}
