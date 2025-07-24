import { ReactNode } from 'react';

import { PolicyRequestInputs } from '@/types/policy';

export default async function SurrenderFlow({
  children,
}: {
  params: PolicyRequestInputs;
  children: ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
    </div>
  );
}
