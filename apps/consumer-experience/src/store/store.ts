import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface BpmStoreTypes {
  bpmAction: BpmAction | null;
  updateBpmAction: (values: BpmAction) => void;
  removeBpmAction: () => void;
}

export enum ActionTypes {
  ADD = 'add',
  EDIT = 'edit',
  REMOVE = 'remove',
}

/**
 *These map to properties we can update with BPM.  */
export enum PropertyKeys {
  ADDRESSES = 'addresses',
  BANK_DETAILS = 'bankDetails',
}

export interface BpmAction {
  actionType: ActionTypes;
  itemValue?: string;
  propertyKey: PropertyKeys;
  itemKey: string;
  changes?: {
    fieldName?: string;
    value?: string;
  }[];
}

export const useBpmStore = create(
  persist(
    devtools<BpmStoreTypes>(set => ({
      bpmAction: null,
      updateBpmAction: (values: BpmAction) =>
        set({ bpmAction: values }, undefined, 'bpm/updateBpmAction'),
      removeBpmAction: () =>
        set({ bpmAction: null }, undefined, 'bpm/removeBpmAction'),
    })),
    { name: 'bpm' }
  )
);
