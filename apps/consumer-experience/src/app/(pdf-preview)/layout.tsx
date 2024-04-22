import { UserProvider } from '@auth0/nextjs-auth0/client';

import styles from '@/app/layout.module.css';
import { SessionManager } from '@/components/session/SessionManager';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <main className={`${styles.body} ${styles.main}`}>
        <SessionManager>
          <>{children}</>
        </SessionManager>
      </main>
    </UserProvider>
  );
}
