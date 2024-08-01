import { Error } from '@zinnia/api-types/types/bpm';
import { BankAccountChangeRequest } from '@zinnia/api-types/types/sor';

export interface TransactionEligbility {
  isEligible?: boolean | null;
  reason?: Error[];
}

export interface BankRequest {
  planCode: string;
  policyNumber: string;
  partyId: string;
  bankId?: string;
  bankAccountChangeRequest: BankAccountChangeRequest;
}
