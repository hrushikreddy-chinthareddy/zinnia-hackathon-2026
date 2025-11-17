import { Frequency } from '@zinnia/api-types/types/bpm';
export interface BpmSuccessResponse {
  correlationId: string;
  caseId: string;
  caseStatus: string;
}

type ValidationResult = {
  errorCode: string;
  attribute: string | null;
  error: string;
  resolution: string;
};

export interface BpmErrorResponse {
  status: 'failure';
  validationResult: ValidationResult[];
}

export const isBpmError = (e: unknown): e is BpmErrorResponse => {
  return (e as BpmErrorResponse)?.validationResult?.length > 0;
};

interface SystematicPremiumQuoteAmount {
  frequency: keyof typeof Frequency;
  amount: number;
}

export type SystematicPremiumQuoteAmountsResponse =
  SystematicPremiumQuoteAmount[];
