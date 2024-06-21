import { Error } from '@zinnia/api-types/types/bpm';

export interface TransactionEligbility {
  isEligible?: boolean | null;
  reason?: Error[];
}
