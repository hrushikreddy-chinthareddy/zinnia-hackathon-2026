// TODO: add tests!!!!!
import { ZodObject, ZodRawShape } from 'zod';

export interface StepProps<T> {
  planCode: string;
  policyNumber: string;
  step: T;
}

export interface StepInfo {
  title: string;
  order: number | null;
  url: string;
  actions?: {
    primary?: {
      text: string;
      onClick: () => void;
    } | null;
    secondary?: {
      text: string;
      onClick: () => void;
    } | null;
  };
  requiredData?: ZodObject<ZodRawShape>;
}
