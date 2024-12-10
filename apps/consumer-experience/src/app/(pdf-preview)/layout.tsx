import Analytics from '@/components/analytics/Analytics';
import { SessionManager } from '@/components/providers/SessionManager';
import { UserProvider } from '@/components/providers/UserProvider';
import { getSession } from '@/utils/auth';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <main>
      <UserProvider user={session?.user}>
        <SessionManager>
          {children}
          <Analytics />
        </SessionManager>
      </UserProvider>
    </main>
  );
}
