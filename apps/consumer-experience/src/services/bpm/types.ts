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
