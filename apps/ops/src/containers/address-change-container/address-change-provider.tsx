import { useContext, useState } from 'react';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import { AddressChangeContext } from '@deps/contexts/AddressChangeContext';
import { FormValidationErrors , Address } from '@deps/models/case/withdrawal/case';
import { Phone, PhoneType, PolicyParties } from '@deps/models/policy/sor-policy';

import { ApplyToRolesState, ContractUpdateOptions, SignatureState } from './types/address-change-types';

type AddressChangeProviderProps = {
    children: React.ReactNode;
};

const INITIAL_PHONE: Phone = {
    countryCode: '1',
    phoneType: PhoneType.HOME,
};

const INITIAL_FORM_DATA: any = {
    caseId: undefined,
    businessKey: undefined,
    isPhoneChangeRequire: false,
    isAddressChangeRequire: false,
    isValidAddress: null,
    selectedId: undefined,
    addresses: {
        entered: {},
        validated: {},
    },
};

export const AddressChangeProvider = ({ children }: AddressChangeProviderProps) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [signatureData, setSignatureData] = useState<SignatureState>({ signatures: [] });
    const [contractUpdateOption, setContractUpdateOption] = useState<ContractUpdateOptions>(ContractUpdateOptions.currentContract);
    const [roleIdentifier, setRoleIdentifier] = useState<PolicyParties>({});
    const [applyToRoles, setApplyToRoles] = useState<ApplyToRolesState[]>([]);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [formWarnings, setFormWarnings] = useState<FormValidationErrors>({});
    const [phone, setPhone] = useState(INITIAL_PHONE);
    const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    return (
        <AddressChangeContext.Provider
            value={{
                formData,
                contractUpdateOption,
                roleIdentifier,
                applyToRoles,
                signatureData,
                formErrors,
                formWarnings,
                phone,
                address,
                selectedIds,
                setContractUpdateOption,
                setRoleIdentifier,
                setApplyToRoles,
                setFormData,
                setSignatureData,
                setFormWarnings,
                setFormErrors,
                setPhone,
                setAddress,
                setSelectedIds
            }}
        >
            {children}
        </AddressChangeContext.Provider>
    );
};

export const useAddressChange = () => {
    const context = useContext(AddressChangeContext);

    if (!context) {
        throw new Error('useAddressChange must be used within a AddressChangeProvider');
    }
    return context;
};
