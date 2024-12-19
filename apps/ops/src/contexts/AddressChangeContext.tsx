import { createContext } from 'react';

import { ApplyToRolesState, ContractUpdateOptions, SignatureState } from '@deps/containers/address-change-container/types/address-change-types';
import { Address, FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Phone, PolicyParties } from '@deps/models/policy/sor-policy';

//TODO: Update all any with the types, we get from api response
export type AddressChangeFormState = {
    formData: any;
    contractUpdateOption: ContractUpdateOptions;
    roleIdentifier: PolicyParties;
    applyToRoles: ApplyToRolesState[];
    signatureData: SignatureState;
    formErrors: FormValidationErrors;
    formWarnings: any;
    phone: Phone;
    address: Address;
    selectedIds: number[],
    submitSuccess: boolean;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setContractUpdateOption: React.Dispatch<React.SetStateAction<ContractUpdateOptions>>;
    setRoleIdentifier: React.Dispatch<React.SetStateAction<PolicyParties>>;
    setApplyToRoles: React.Dispatch<React.SetStateAction<ApplyToRolesState[]>>;
    setSignatureData: React.Dispatch<React.SetStateAction<SignatureState>>;
    setFormErrors: React.Dispatch<React.SetStateAction<any>>;
    setFormWarnings: React.Dispatch<React.SetStateAction<any>>;
    setPhone: React.Dispatch<React.SetStateAction<Phone>>;
    setAddress: React.Dispatch<React.SetStateAction<Address>>;
    setSelectedIds: React.Dispatch<React.SetStateAction<number[]>>;
    setSubmitSuccess: React.Dispatch<React.SetStateAction<boolean>>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const addressChangeDefaultValues = {
    formData: {} as any,
    contractUpdateOption: ContractUpdateOptions.currentContract,
    applyToRoles: [],
    roleIdentifier: {},
    signatureData: { signatures: [] },
    formErrors: {} as any,
    formWarnings: {} as any,
    phone: {} as any,
    address: {} as any,
    selectedIds: [] as any,
    submitSuccess:  false,
    setContractUpdateOption: noop,
    setFormData: noop,
    setRoleIdentifier: noop,
    setApplyToRoles: noop,
    setSignatureData: noop,
    setFormErrors: noop,
    setFormWarnings: noop,
    setPhone: noop,
    setAddress: noop,
    setSelectedIds: noop,
    setSubmitSuccess: noop,
};

export const AddressChangeContext = createContext<AddressChangeFormState>(addressChangeDefaultValues);
