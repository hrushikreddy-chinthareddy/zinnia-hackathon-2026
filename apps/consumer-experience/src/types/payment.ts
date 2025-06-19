import { PaymentusAccountType } from './paymentus';

export enum PaymentProvider {
  ZINNIA = 'ZINNIA',
  PAYMENTUS = 'PAYMENTUS',
}
export interface PaymentConfig {
  provider: PaymentProvider;
  verifyIdentityRequired: boolean;
}

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
