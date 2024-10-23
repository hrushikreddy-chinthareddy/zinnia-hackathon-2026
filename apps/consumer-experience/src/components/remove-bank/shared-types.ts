import { AccountType } from '@zinnia/api-types/types/sor';

export enum FormMode {
  EDIT = 'edit',
  ADD = 'add',
}

export enum FormSteps {
  ADD_EDIT = 'ADD',
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
