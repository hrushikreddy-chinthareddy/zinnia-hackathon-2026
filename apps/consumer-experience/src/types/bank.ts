import { AccountType } from '@zinnia/api-types/types/sor';

export interface BankFormFields {
  accountType?: AccountType;
  branchName?: string;
  routingNumber?: string;
  accountNumber?: string;
  autopayEnabled?: boolean;
}
