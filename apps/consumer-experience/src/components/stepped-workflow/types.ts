// TODO: add tests!!!!!
import { ZodObject, ZodRawShape } from 'zod';

export interface StepProps<T> {
  // base url
  baseUrl: string;
  // url for when user clicks cancel
  cancelUrl: string;
  // url for when user reaches end of flow
  returnUrl: string;
  planCode: string;
  policyNumber: string;
  stepsInfo: StepInfo[];
  step: T;
}

export interface StepInfo {
  title: string;
  order: number | null;
  url: string;
  actions?: {
    primary?: {
      text: string;
      onClick?: () => void;
    } | null;
    secondary?: {
      text: string;
      onClick?: () => void;
    } | null;
  };
  requiredData?: ZodObject<ZodRawShape>;
}

export const TRANSACTION_ERROR_QUERY_PARAM = 'errorType';

export enum TransactionErrorType {
  SUBMISSION_FAILED = 'SubmissionFailed',
}
