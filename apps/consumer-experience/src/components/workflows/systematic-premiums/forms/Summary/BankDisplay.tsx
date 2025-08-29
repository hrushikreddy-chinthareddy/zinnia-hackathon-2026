import { Tag, TagVariant } from '@zinnia/bloom/components';

import { AccountNumber } from '@/components/pii/AccountNumber';
import { BankName } from '@/components/pii/BankName';
import commonStyles from '@/components/stepped-workflow/common/Styles.module.css';
import { PaymentMethod } from '@/types/payment';

export const BankDisplay = ({
  paymentMethod,
}: {
  paymentMethod: PaymentMethod;
}) => {
  return (
    <div className={commonStyles.bankDisplay}>
      {paymentMethod.accountType && (
        <Tag text={paymentMethod.accountType} variant={TagVariant.White} />
      )}
      <div>
        <BankName
          bankName={paymentMethod.branchName}
          accountType={paymentMethod.accountType}
        />
      </div>
      <div className="typography-content-body-sm">
        Checking ending in{' '}
        <AccountNumber accountNumber={paymentMethod.accountNumber} />
      </div>
    </div>
  );
};
