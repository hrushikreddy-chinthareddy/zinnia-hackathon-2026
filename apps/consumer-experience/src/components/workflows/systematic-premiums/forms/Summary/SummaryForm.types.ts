import { Frequency, PaymentForm } from '@xd/api-types/dist/generated-types/bpm';

import { PaymentMethod } from '@/types/payment';
import { PolicyParty } from '@/types/policy';

export interface TableValuesObject {
  amount: string;
  frequency: Frequency;
  nextPaymentDate: string;
  bank: PaymentMethod;
  payor: PolicyParty;
  paymentForm: PaymentForm;
}

export type TableValues = {
  newValues: TableValuesObject;
  currentValues?: TableValuesObject;
};
