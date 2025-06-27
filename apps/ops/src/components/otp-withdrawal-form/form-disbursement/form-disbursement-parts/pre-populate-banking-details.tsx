import React, { createContext } from 'react';

export interface SelectedBankState {
    isBankSelected: boolean;
    setBankSelected: React.Dispatch<React.SetStateAction<boolean>>;
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const defaultSelectedBankContext = {
    isBankSelected: false,
    setBankSelected: noop,
};

export const SelectedBankContext = createContext<SelectedBankState>(
    defaultSelectedBankContext as SelectedBankState
);
