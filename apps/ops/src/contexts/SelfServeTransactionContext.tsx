import { createContext } from 'react';

export type SelfServeTransactionFormState = {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

export const SelfServeTransactionDefaultValues = {
    formData: {} as any,
    setFormData: noop,
};

export const SelfServeTransactionContext =
    createContext<SelfServeTransactionFormState>(
        SelfServeTransactionDefaultValues
    );
