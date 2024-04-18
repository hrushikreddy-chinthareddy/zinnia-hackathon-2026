import { UserProvider } from '@auth0/nextjs-auth0/client';

import type { Metadata } from 'next';

import '@/app/styles/globals.css';

import styles from '@/app/layout.module.css';
import { SessionManager } from '@/components/session/SessionManager';

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Consumer UI',
  description: 'Consumer UI',
};

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <main>
        <SessionManager>
          <>{children}</>
        </SessionManager>
      </main>
    </UserProvider>
  );
}
