import { Error, AddressChangeRequest } from '@zinnia/api-types/types/bpm';
import { BankAccountChangeRequest } from '@zinnia/api-types/types/sor';

export interface TransactionEligbility {
  isEligible?: boolean | null;
  reason?: Error[];
}

interface NonFinancialTransactionParameters {
  planCode: string;
  policyNumber: string;
  partyId: string;
}

export interface BankRequest extends NonFinancialTransactionParameters {
  bankId?: string;
  bankAccountChangeRequest: BankAccountChangeRequest;
  deleteRequest?: boolean;
}

export interface AddressRequest extends NonFinancialTransactionParameters {
  addressId?: string;
  addressChangeRequest: AddressChangeRequest;
  deleteRequest?: boolean;
}

export enum FormSteps {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  CONFIRM = 'CONFIRM',
}

export interface BPMResponse {
  correlationId: string;
  caseId: string;
  caseStatus: string;
  messages: {
    title: string;
    message: string;
  };
}
