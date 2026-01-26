import React, { createContext } from 'react';

import { SignatureState } from '@deps/containers/bene-change/bene-change.types';
import { PeopleState } from '@deps/containers/people-sub-page';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { SorSystem } from '@deps/models/policy/enums';
import { TransactionResponse } from '@deps/queries/api/bpm';
import {
    Address,
    Email,
    Parties,
    PartyType,
    Phone,
} from '@zinnia/api-types/types/sor';

//TODO: Update all any with the types, we get from api response
export type BeneChangeFormState = {
    isPeopleView: boolean;
    peopleSelection: PeopleState;
    formData: any;
    signatureData: SignatureState;
    formErrors: FormValidationErrors;
    beneData: any;
    deletedBene: any;
    ownerInfo: any;
    SOR: string | null;
    eligibility: boolean;
    validationResponse?: TransactionResponse;
    setFormErrors: React.Dispatch<React.SetStateAction<any>>;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setBeneData: React.Dispatch<React.SetStateAction<any>>;
    setDeletedBene: React.Dispatch<React.SetStateAction<any>>;
    setSignatureData: React.Dispatch<React.SetStateAction<SignatureState>>;
    setPeopleSelection: React.Dispatch<React.SetStateAction<PeopleState>>;
    setIsPeopleView: React.Dispatch<React.SetStateAction<boolean>>;
    setOwnerInfo: React.Dispatch<React.SetStateAction<any>>;
    setSOR: React.Dispatch<React.SetStateAction<string | null>>;
    setEligibility: React.Dispatch<React.SetStateAction<boolean>>;
    setValidationResponse: React.Dispatch<
        React.SetStateAction<TransactionResponse | undefined>
    >;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const beneChangeDefaultValues = {
    isPeopleView: true,
    formData: {} as any,
    beneData: {} as any,
    deletedBene: {} as any,
    signatureData: {
        signatures: [],
        isIrrevocableBene: false,
        isSpousePresent: null,
    },
    formErrors: {} as any,
    peopleSelection: {} as any,
    ownerInfo: {} as any,
    SOR: null,
    eligibility: false,
    validationResponse: undefined,
    setIsPeopleView: noop,
    setPeopleSelection: noop,
    setFormErrors: noop,
    setSignatureData: noop,
    setFormData: noop,
    setBeneData: noop,
    setDeletedBene: noop,
    setOwnerInfo: noop,
    setSOR: noop,
    setEligibility: noop,
    setValidationResponse: noop,
};

export const BeneChangeContext = createContext<BeneChangeFormState>(
    beneChangeDefaultValues
);

export interface BeneficiaryItem {
    partyRole: {
        partyId?: string;
    };
    party: {
        info?: {
            partyType?: PartyType;
            prefix?: string;
            firstName?: string;
            middleName?: string;
            lastName?: string;
            suffix?: string;
            fullName?: string;
            dateOfBirth?: string;
            gender?: string;
            trustType?: string;
            ssn?: string;
            trustDate?: string;
        };
        allocation?: {
            beneficiaryPercentage?: number;
            relationshipToParty?: string;
        };
        addresses?: Array<Address>;
        phones?: Array<Phone>;
        emails?: Array<Email>;
    };
    beneInfo?: {
        isPerStirpes?: boolean;
        isIrrevocable?: boolean;
    };
}

export interface ExtendedParty extends Parties {
    isPerStirpes?: boolean;
}

export interface SignatureInfo {
    signatures: {
        signType: string | null | undefined;
        isSignedPresent: boolean;
        signDate: string | null;
        signPrintName: string | null;
        signGurantee: string | null | undefined;
        signDesignation: string | null;
    }[];
    isSpousePresent: boolean | null;
    isIrrevocableBene: boolean;
}

export interface BeneChangePayload {
    businessKey?: string;
    correlationid?: string;
    policyNumber: string;
    planCode: string;
    carrierId?: string;
    sorSystem: SorSystem;
    actionData: Array<{
        party: ExtendedParty;
    }>;
    contractInfo?: {
        parties: ExtendedParty;
    };
    onbaseCaseId?: string;
    caseId?: string;
    documentDate?: string | null;
    channel?: string;
    policyStatus?: string;
    isPrimaryBeneInfoOnFile?: boolean;
    isContingentBeneInfoOnFile?: boolean;
    signatureData: SignatureInfo;
}
