import { ReactNode } from 'react';

import { OttpProvider } from '@/components/stepped-workflow/workflows/one-time-premium/provider/OttpProvider';
import { PolicyRequestInputs } from '@/types/policy';

export default async function PremiumPaymentPage({
  children,
}: {
  params: PolicyRequestInputs;
  children: ReactNode;
}) {
  return (
    <div>
      <OttpProvider>
        <div>{children}</div>
      </OttpProvider>
    </div>
  );
}
