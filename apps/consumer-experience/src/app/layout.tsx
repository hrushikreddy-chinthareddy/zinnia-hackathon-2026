import { getSession } from '@auth0/nextjs-auth0';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import localFont from 'next/font/local';

import type { Metadata } from 'next';

import './styles/globals.css';

import { DesktopNav } from '@/components/desktop-nav/DesktopNav';
import { MobileNav } from '@/components/mobile-nav/MobileNav';

import styles from './layout.module.css';
import { Footer } from '@/components/footer/Footer';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Consumer UI',
  description: 'Consumer UI',
};

const myFont = localFont({
  src: './styles/everly/fonts/Poppins-Regular.ttf', // TODO: 'everly' needs to be dynamic
  display: 'swap',
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return (
      <html lang="en" className={myFont.className}>
        <body>
          <div>{children}</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={myFont.className}>
      <UserProvider>
        <body className={styles.body}>
          {/* To prevent hydration error by trying to render these dynamically using screen width,
          dynamically displaying using media queries */}
          <MobileNav />
          <DesktopNav />
          <div className={styles.container}>
            <div className={styles.content}>
              <>
                {children}
                <Footer />
              </>
            </div>
          </div>
        </body>
      </UserProvider>
    </html>
  );
}
