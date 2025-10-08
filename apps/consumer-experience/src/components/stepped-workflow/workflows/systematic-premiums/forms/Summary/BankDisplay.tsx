import { Tag, TagVariant } from '@zinnia/bloom/components';

import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
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
      {/* TODO: what should the credit card one display as? */}
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
        <AccountType accountType={paymentMethod.accountType} /> ending in{' '}
        <AccountNumber accountNumber={paymentMethod.accountNumber} />
      </div>
    </div>
  );
};
