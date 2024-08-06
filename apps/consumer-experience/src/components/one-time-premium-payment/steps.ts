import { selectBankSchema } from '../providers/one-time-premium-payment/types';

const paymentUrl = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => `/policies/${planCode}/${policyNumber}/premium`;

export enum Steps {
  AMOUNT = 'amount',
  BANK = 'bank',
  SUMMARY = 'summary',
  SUBMITTED = 'submitted',
}

export const stepsOrder = [
  Steps.AMOUNT,
  Steps.BANK,
  Steps.SUMMARY,
  Steps.SUBMITTED,
];
const defaultStep = 'premium';

interface URLProps {
  planCode: string;
  policyNumber: string;
  currentStep: Steps;
}

export const getNextUrl = ({
  currentStep,
  planCode,
  policyNumber,
}: URLProps) => {
  const indexOfNext = stepsOrder.indexOf(currentStep) + 1;
  const nextStep = stepsOrder[indexOfNext] ?? '';
  return `${paymentUrl({
    planCode,
    policyNumber,
  })}/${nextStep}`;
};

export const getPrevUrl = ({
  currentStep,
  planCode,
  policyNumber,
}: URLProps) => {
  const indexOfPrev = stepsOrder.indexOf(currentStep) - 1;
  const prevStep = stepsOrder[indexOfPrev] ?? '';
  return `${paymentUrl({
    planCode,
    policyNumber,
  })}/${prevStep}`;
};

export const oneTimePremiumSteps = {
  [Steps.AMOUNT]: {
    title: 'Make a one-time payment',
    nextUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getNextUrl({
        currentStep: Steps.AMOUNT,
        planCode,
        policyNumber,
      }),
    prevUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getPrevUrl({
        currentStep: Steps.AMOUNT,
        planCode,
        policyNumber,
      }),
  },
  [Steps.BANK]: {
    title: 'select payment method',
    nextUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getNextUrl({
        currentStep: Steps.BANK,
        planCode,
        policyNumber,
      }),
    prevUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getPrevUrl({
        currentStep: Steps.BANK,
        planCode,
        policyNumber,
      }),
    requiredData: selectBankSchema,
  },
  [Steps.SUMMARY]: {
    title: 'summary',
    nextUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getNextUrl({
        currentStep: Steps.SUMMARY,
        planCode,
        policyNumber,
      }),
    prevUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getPrevUrl({
        currentStep: Steps.SUMMARY,
        planCode,
        policyNumber,
      }),
    requiredData: selectBankSchema,
  },
  [Steps.SUBMITTED]: {
    title: 'submitted!',
    nextUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getNextUrl({
        currentStep: Steps.SUBMITTED,
        planCode,
        policyNumber,
      }),
    prevUrl: ({
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    }) =>
      getPrevUrl({
        currentStep: Steps.SUBMITTED,
        planCode,
        policyNumber,
      }),
    requiredData: selectBankSchema,
  },
};
