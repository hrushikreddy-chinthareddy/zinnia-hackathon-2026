import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { PaymentusAddPaymentMethod } from '@/components/paymentus/PaymentusAddPaymentMethod';
import { getPaymentusUserPaymentsList } from '@/services/payment-methods/paymentus';
import {
  buildCommonLogContext,
  CommonLogContext,
} from '@/utils/logging/server-logging';

import { PaymentProfilesList } from './PaymentProfilesList';

export const PaymentDetails = async ({
  verifyIdentityRequired,
  policyNumber,
}: {
  verifyIdentityRequired?: boolean;
  policyNumber: string;
}) => {
  const loggingContext: CommonLogContext = await buildCommonLogContext();
  const { data } = await getPaymentusUserPaymentsList(
    // @TODO: CUI-874: get userId from access token ecn
    { userId: '7657659', isMock: false },
    loggingContext
  );

  return (
    <div>
      <h2 id="addBankSection">Payment Methods</h2>
      <p className="my-lg">
        Need help updating banking details? Give us a call at&nbsp;
        <CarrierPhoneNumber />.
      </p>
      {data && data.length > 0 && (
        <PaymentProfilesList
          profiles={data}
          verifyIdentityRequired={verifyIdentityRequired}
        />
      )}
      <PaymentusAddPaymentMethod policyNumber={policyNumber} />
    </div>
  );
};
