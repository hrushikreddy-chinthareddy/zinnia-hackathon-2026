import { AccountType } from '@zinnia/api-types/types/sor';

export enum FormMode {
  EDIT = 'edit',
  ADD = 'add',
}

export enum FormSteps {
  ADD_EDIT = 'ADD_EDIT',
  REMOVE_CONFIRM = 'REMOVE_CONFIRM',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export interface FormFields {
  accountType?: AccountType;
  bankNickname?: string;
  routingNumber?: string;
  accountNumber?: string;
  autopayEnabled?: boolean;
}
