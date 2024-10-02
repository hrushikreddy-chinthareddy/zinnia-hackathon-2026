// TODO: add tests!!!!!
import { ZodObject } from 'zod';

import {
  selectBankSchema,
  summarySchema,
} from '../providers/one-time-premium-payment/types';

export enum Steps {
  AMOUNT = 'amount',
  BANK = 'bank',
  SUMMARY = 'summary',
  SUBMITTED = 'submitted',
}

interface StepProps {
  planCode: string;
  policyNumber: string;
  step: Steps;
}

interface StepInfo {
  title: string;
  requiredData?: ZodObject<any>;
}

export const defaultStep = Steps.AMOUNT;
export const stepsOrder: Steps[] = [
  Steps.AMOUNT,
  Steps.BANK,
  Steps.SUMMARY,
  Steps.SUBMITTED,
];

export const stepsInfo: Record<Steps, StepInfo> = {
  [Steps.AMOUNT]: {
    title: 'Make a one-time payment',
  },
  [Steps.BANK]: {
    title: 'select payment method',
    requiredData: selectBankSchema,
  },
  [Steps.SUMMARY]: {
    title: 'summary',
    requiredData: selectBankSchema.merge(summarySchema),
  },
  [Steps.SUBMITTED]: {
    title: 'submitted!',
    requiredData: selectBankSchema.merge(summarySchema),
  },
};

export const paymentUrl = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
  // TODO: annuities logic
}) => `/coverage/policies/${planCode}/${policyNumber}/premium`;

export const getNextUrl = ({
  step,
  planCode,
  policyNumber,
}: StepProps): string => {
  const indexOfNext = stepsOrder.indexOf(step) + 1;
  const nextStep = stepsOrder[indexOfNext || 0];
  return `${paymentUrl({
    planCode,
    policyNumber,
  })}/${nextStep || ''}`;
};

export const getPrevUrl = ({
  step,
  planCode,
  policyNumber,
}: StepProps): string => {
  const indexOfPrev = stepsOrder.indexOf(step) - 1;
  const prevStep = stepsOrder[indexOfPrev || 0];
  return `${paymentUrl({
    planCode,
    policyNumber,
  })}/${prevStep || ''}`;
};

export const getStepInfo = ({ step, planCode, policyNumber }: StepProps) => {
  return {
    title: stepsInfo[step].title,
    requiredData: stepsInfo[step].requiredData,
    stepUrl: `${paymentUrl({
      planCode,
      policyNumber,
    })}/${step}`,
    nextStepUrl: getNextUrl({ step, planCode, policyNumber }),
    prevStepUrl: getPrevUrl({ step, planCode, policyNumber }),
  };
};
