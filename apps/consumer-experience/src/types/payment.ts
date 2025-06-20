import { PaymentusAccountType } from './paymentus';

export interface PaymentMethod {
  bankId?: string;
  branchName?: string;
  accountType?: string;
  accountNumber?: string;
  autopayEnabled?: boolean;
  type?: PaymentusAccountType;
  appliesToPartyId?: string;
  nameOnAccount?: string;
}
