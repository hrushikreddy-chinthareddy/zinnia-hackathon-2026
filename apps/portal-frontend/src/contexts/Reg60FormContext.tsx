import { createContext } from 'react';

import { Disclosure } from '@deps/containers/otp/reg60-forms/components/create-disclosure/create-disclosure.types';
import { DisclosureAuthorizationInformation } from '@deps/containers/otp/reg60-forms/components/disclosure-authorization/disclosure-authorization.types';
import { UserInfo } from '@deps/containers/otp/reg60-forms/components/user-information/user-information.type';
import { ActiveReg60Case, CurrentPage } from '@deps/containers/otp/reg60-forms/reg60.types';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

export interface OtpReg60FormState {
    caseId?: string;
    id?: string;
    isFormStateReadOnly: boolean;

    formErrors: FormValidationErrors;
    initialForm: ActiveReg60Case;
    currentPage: CurrentPage;
    ownerInformation: UserInfo;
    agentInformation: UserInfo;
    disclosure: Disclosure;
    disclosureAuthorization: DisclosureAuthorizationInformation;
    setDisclosure: React.Dispatch<React.SetStateAction<Disclosure>>;
    setOwnerInformation: React.Dispatch<React.SetStateAction<UserInfo>>;
    setAgentInformation: React.Dispatch<React.SetStateAction<UserInfo>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<CurrentPage>>;
    setDisclosureAuthorization: React.Dispatch<React.SetStateAction<DisclosureAuthorizationInformation>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
}

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

export const defaultFormDataContext = {
    initialForm: {} as ActiveReg60Case,
    disclosureAuthorization: {} as DisclosureAuthorizationInformation,
    ownerInformation: {} as UserInfo,
    agentInformation: {} as UserInfo,
    disclosure: {} as Disclosure,
    formErrors: {} as FormValidationErrors,
    currentPage: CurrentPage.INFO,
    setFormErrors: noop,
    setCurrentPage: noop,
    setAgentInformation: noop,
    setOwnerInformation: noop,
    setDisclosure: noop,
    setDisclosureAuthorization: noop,
};

export const Reg60FormContext = createContext<OtpReg60FormState>(defaultFormDataContext as OtpReg60FormState);
