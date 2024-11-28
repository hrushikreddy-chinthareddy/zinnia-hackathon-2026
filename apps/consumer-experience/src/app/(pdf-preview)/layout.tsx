import { SessionManager } from '@/components/providers/SessionManager';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <SessionManager>
        <>{children}</>
      </SessionManager>
    </main>
  );
}
