import { getSession } from '@auth0/nextjs-auth0';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import localFont from 'next/font/local';

import type { Metadata } from 'next';

import './styles/globals.css';

import { DesktopNav } from '@/components/desktop-nav/DesktopNav';
import { Footer } from '@/components/footer/Footer';
import { MobileNav } from '@/components/mobile-nav/MobileNav';

import styles from './layout.module.css';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Consumer UI',
  description: 'Consumer UI',
};
const primaryFont = localFont({
  variable: '--font-family-primary',
  display: 'swap',
  src: [
    {
      path: './styles/everly/fonts/Poppins-ExtraLight.ttf',
      style: 'normal',
      weight: '200',
    },
    {
      path: './styles/everly/fonts/Poppins-Light.ttf',
      style: 'normal',
      weight: '300',
    },

    {
      path: './styles/everly/fonts/Poppins-Regular.ttf',
      style: 'normal',
      weight: '400',
    },

    {
      path: './styles/everly/fonts/Poppins-Medium.ttf',
      style: 'normal',
      weight: '500',
    },

    {
      path: './styles/everly/fonts/Poppins-SemiBold.ttf',
      style: 'normal',
      weight: '600',
    },
    {
      path: './styles/everly/fonts/Poppins-Bold.ttf',
      style: 'normal',
      weight: '700',
    },
  ], // TODO: 'everly' needs to be dynamic
});

const secondaryFont = localFont({
  variable: '--font-family-secondary',
  src: [
    {
      path: './styles/everly/fonts/Lato-Light.ttf',
      style: 'normal',
      weight: '300',
    },
    {
      path: './styles/everly/fonts/Lato-Regular.ttf',
      style: 'normal',
      weight: '400',
    },
    {
      path: './styles/everly/fonts/Lato-Bold.ttf',
      style: 'normal',
      weight: '700',
    },

    {
      path: './styles/everly/fonts/Lato-Black.ttf',
      style: 'normal',
      weight: '900',
    },
  ],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return (
      <html
        lang="en"
        className={`${primaryFont.variable} ${secondaryFont.variable}`}
      >
        <body>
          <div>{children}</div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable}`}
    >
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
