import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { BankDetail } from '@/components/person-data/types';

interface BpmStoreTypes {
  bpmAction: BpmBankAction | null;
  updateBpmAction: (values: BpmBankAction) => void;
  removeBpmAction: () => void;
}

export enum ActionTypes {
  ADD = 'add',
  EDIT = 'edit',
  REMOVE = 'remove',
}

export interface BpmBankAction {
  actionType: ActionTypes;
  bankAccountNumber?: string;
  changes?: {
    fieldName?: keyof BankDetail;
    value?: string;
  }[];
}

export const useBpmStore = create(
  devtools<BpmStoreTypes>(set => ({
    bpmAction: null,
    updateBpmAction: (values: BpmBankAction) =>
      set({ bpmAction: values }, undefined, 'bpm/updateBpmAction'),
    removeBpmAction: () =>
      set({ bpmAction: null }, undefined, 'bpm/removeBpmAction'),
  }))
);
