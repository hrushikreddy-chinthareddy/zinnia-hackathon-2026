import { useEffect, useState } from 'react';

export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) {
    return null;
  }

  return <>{children}</>;
};
