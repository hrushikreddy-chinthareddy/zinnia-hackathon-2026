import { Icon, IconType, SideSheet } from '@zinnia/bloom/components';

import { Button } from '@/components/button/Button';
import { CarrierPhoneNumber } from '@/components/carrier-phone-number/CarrierPhoneNumber';
import { getPaymentusUserPaymentsList } from '@/services/paymentus';
import {
  buildCommonLogContext,
  CommonLogContext,
} from '@/utils/logging/server-logging';

import { PaymentProfilesList } from './PaymentProfilesList';

export const PaymentDetails = async () => {
  const loggingContext: CommonLogContext = await buildCommonLogContext();
  const { data } = await getPaymentusUserPaymentsList(
    { userId: '7657659', isMock: false },
    loggingContext
  );

  return (
    <div>
      <h2 id="addBankSection">Payment Methods</h2>
      <p>
        Need help updating banking details? Give us a call at&nbsp;
        <CarrierPhoneNumber />.
      </p>
      {data && data.length > 0 && <PaymentProfilesList profiles={data} />}
      <SideSheet
        header="Add Payment Method"
        trigger={
          <Button size="small" mode="link">
            <Icon small type={IconType.ADD} />
            Add payment method
          </Button>
        }
      >
        TODO: Add bank iframe here
      </SideSheet>
    </div>
  );
};
