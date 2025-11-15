import { DisbursementPaymentForm } from '@xd/api-types/dist/generated-types/bpm';
import { Address, BankAccount } from '@xd/api-types/dist/generated-types/sor';
import z from 'zod';

import { PolicyParty } from '@/types/policy';

// These need to match the routes defined in the app directory
export enum FreeLookCancelUrlPaths {
  INFO = 'information',
  DATE = 'date',
  PAYEE = 'payee',
  DISTRIBUTION = 'distribution',
  SUMMARY = 'summary',
  MFA = 'verify-identity',
  SUBMITTED = 'submitted',
}

export enum FreeLookCancelAction {
  SET_FREE_LOOK_CANCEL_DATE_STEP = 'setFreeLookCancelDateStep',
  SET_FREE_LOOK_CANCEL_PAYEE_STEP = 'setFreeLookCancelPayeeStep',
  SET_FREE_LOOK_CANCEL_DISTRIBUTION_METHOD_STEP = 'setFreeLookCancelDistributionMethodStep',
}

// TODO: is this even worth doing? naaaah. remove ZOD
export const dateValidationSchema = z.object({
  netSurrenderValue: z.number().nullish(),
  cancellationDate: z.string(),
});

export const payeeValidationSchema = z.object({
  partyId: z.string(),
});

export const distributionMethodValidationSchema = z.object({
  distributionType: z.enum([
    DisbursementPaymentForm.ACH,
    DisbursementPaymentForm.CHECK,
  ]),
  address: z
    .object({
      addressId: z.string(),
    })
    .optional(),
  bank: z
    .object({
      bankId: z.string(),
    })
    .optional(),
});

type DateStepAction = {
  type: FreeLookCancelAction.SET_FREE_LOOK_CANCEL_DATE_STEP;
  payload: z.infer<typeof dateValidationSchema>;
};

type PayeeStepAction = {
  type: FreeLookCancelAction.SET_FREE_LOOK_CANCEL_PAYEE_STEP;
  payload: PolicyParty;
};

type DistributionMethodStepAction = {
  type: FreeLookCancelAction.SET_FREE_LOOK_CANCEL_DISTRIBUTION_METHOD_STEP;
  payload: {
    type: DisbursementPaymentForm;
    method: Address | BankAccount;
  };
};

export type FreeLookCancelState = {
  dateStep: z.infer<typeof dateValidationSchema>;
  payeeStep?: PolicyParty;
  distributionMethodStep: {
    type: DisbursementPaymentForm;
    method?: Address | BankAccount;
  };
};
export type Action =
  | DateStepAction
  | PayeeStepAction
  | DistributionMethodStepAction;
export type Dispatch = (action: Action) => void;
