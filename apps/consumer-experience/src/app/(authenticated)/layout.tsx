import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import styles from '@/app/layout.module.css';
import { DesktopNav } from '@/components/desktop-nav/DesktopNav';
import { MobileNav } from '@/components/mobile-nav/MobileNav';
import { SessionManager } from '@/components/session/SessionManager';

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
  return (
    <main className={`${styles.body} ${styles.main}`}>
      <SessionManager>
        {/* To prevent hydration error by trying to render these dynamically using screen width,
          dynamically displaying using media queries */}
        <MobileNav />
        <DesktopNav />
        <div className={styles.container}>
          <div className={styles.content}>
            <>{children}</>
          </div>
        </div>
      </SessionManager>
    </main>
  );
}
