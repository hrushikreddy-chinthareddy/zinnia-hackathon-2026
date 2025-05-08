import { ReactNode } from 'react';

import { OttpProvider } from '@/components/providers/one-time-premium-payment/OttpProvider';
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
