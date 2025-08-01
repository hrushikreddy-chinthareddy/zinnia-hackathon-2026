import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { getPaymentMethods } from '@/services/payment-methods';
import {
  buildCommonLogContext,
  CommonLogContext,
} from '@/utils/logging/server-logging';

import { PaymentProfilesList } from './PaymentProfilesList';

export const PaymentDetails = async ({
  verifyIdentityRequired,
  policyNumber,
  planCode,
}: {
  verifyIdentityRequired?: boolean;
  policyNumber: string;
  planCode: string;
}) => {
  const loggingContext: CommonLogContext = await buildCommonLogContext();
  const { data } = await getPaymentMethods(
    { policyNumber, planCode },
    loggingContext
  );

  return (
    <div>
      <h2 id="addBankSection">Payment Methods</h2>
      <p className="my-lg">
        Need help updating banking details? Give us a call at&nbsp;
        <CarrierPhoneNumber />.
      </p>
      <PaymentProfilesList
        verifyIdentityRequired={verifyIdentityRequired}
        policyNumber={policyNumber}
        planCode={planCode}
        profiles={data || []}
      />
    </div>
  );
};
