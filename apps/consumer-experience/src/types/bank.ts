import { AccountType } from '@zinnia/api-types/types/sor';

export enum FormSteps {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface BankFormFields {
  accountType?: AccountType;
  branchName?: string;
  routingNumber?: string;
  accountNumber?: string;
  autopayEnabled?: boolean;
}
