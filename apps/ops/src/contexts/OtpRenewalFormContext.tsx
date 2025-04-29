import { createContext } from 'react';

import { Statuses } from '@deps/models/case/case';
import { DocumentData } from '@deps/models/case/document';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { TargetFundAllocation, OwnerInformation, renewalsFormParts } from '@deps/models/case/task';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

export interface OtpRenewalFormState {
    initialForm: any;
    parties: LifeCadParty[];
    ownerInformation: OwnerInformation[];
    document: DocumentData;
    channel: Channel;
    renewalRequestSignDate: string;
    subsequentTargetFunds: TargetFundAllocation[] | null;
    transOption: string | null;
    formErrors: FormValidationErrors;
    contractValue: number | string | null;
    setContractValue: React.Dispatch<React.SetStateAction<number | string>>;
    currentFormState: string;
    isFormStateReadOnly: boolean;
    planCode: string
    featureFlags: FeatureFlags;
    setCurrentFormState: React.Dispatch<React.SetStateAction<string>>;
    formValidator: (val?: renewalsFormParts) => FormValidationErrors;
    setOwnerInformation: React.Dispatch<React.SetStateAction<OwnerInformation[]>>;
    setChannel: React.Dispatch<React.SetStateAction<Channel>>;
    setSubsequentTargetFunds: React.Dispatch<React.SetStateAction<TargetFundAllocation[] | null>>;
    setTransOption: React.Dispatch<React.SetStateAction<string | null>>;
    setRenewalRequestSignDate: React.Dispatch<React.SetStateAction<string>>;
    setFormValidator: React.Dispatch<React.SetStateAction<(val?: renewalsFormParts) => FormValidationErrors>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

export const defaultFormDataContext = {
    initialForm: {} as any,
    parties: [],
    ownerInformation: [] as OwnerInformation[],
    formValidator: () => {
        return {} as FormValidationErrors;
    },
    document: {} as DocumentData,
    channel: Channel.Form,
    subsequentTargetFunds: [] as TargetFundAllocation[],
    renewalRequestSignDate: '',
    transOption: '',
    formErrors: {},
    contractValue: '',
    setContractValue: noop,
    currentFormState: Statuses.New,
    isFormStateReadOnly: false,
    planCode: '',
    featureFlags: {},
    setCurrentFormState: noop,
    setSubsequentTargetFunds: noop,
    setOwnerInformation: noop,
    setChannel: noop,
    setRenewalRequestSignDate: noop, // based on selection phoneDate / primary owner signDate
    setTransOption: noop,
    setFormValidator: noop,
    setFormErrors: noop,
};

export const RenewalFormDataContext = createContext<OtpRenewalFormState>(defaultFormDataContext as OtpRenewalFormState);
