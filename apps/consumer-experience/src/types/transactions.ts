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
  correlationId?: string;
}

//TODO: Temporarily do this. Trying to pull in the latest BPM spec led to a ton of type issues throughout the site.
type AddressChangeType = AddressChangeRequest['address'];

//TODO: Temporarily do this. Trying to pull in the latest BPM spec led to a ton of type issues throughout the site.
interface AddressChangeRequestExt extends AddressChangeRequest {
  address: AddressChangeType & {
    isPreferred?: boolean;
  };
  preferredAddressId?: string;
}

export interface AddressRequest extends NonFinancialTransactionParameters {
  addressId?: string;
  addressChangeRequest: AddressChangeRequestExt; //Replace with AddressChangeRequest when BPM spec is updated
  deleteRequest?: boolean;
  correlationId?: string;
}

export enum FormSteps {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  CONFIRM = 'CONFIRM',
  FORM = 'FORM',
  VERIFY_IDENTITY = 'VERIFY_IDENTITY',
  VERIFY_IDENTITY_CODE = 'VERIFY_IDENTITY_CODE',
}

export interface ResponseMessage {
  title: string;
  message: string;
}

export interface BPMResponse {
  correlationId: string;
  caseId: string;
  caseStatus: string;
  messages: ResponseMessage;
}
