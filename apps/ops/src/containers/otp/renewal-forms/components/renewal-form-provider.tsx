import React, { useState } from 'react';

import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { OwnerInformation, TargetFundAllocation, renewalsFormParts } from '@deps/models/case/task';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import { DEFAULT_TRANS_OPTION, getOwnerInfo } from './renewal-form-helper';


interface RenewalFormProviderProps {
    children: React.ReactNode;
    caseDocument: DocumentData;
    parties: LifeCadParty[];
    userId: string;
    action: string;
    featureFlagDecisions: FeatureFlags;
    planCode: string;
}

const RenewalFormProvider = ({ children, parties, caseDocument, action, featureFlagDecisions, planCode }: RenewalFormProviderProps) => {
    const [channel, setChannel] = useState<Channel>(Channel.Form);
    const owners = parties?.filter(party => party.SrcRoleType === 0) || [];
    const ownerInfo = getOwnerInfo(owners);
    const [ownerInformation, setOwnerInformation] = useState<OwnerInformation[]>(ownerInfo);

    const [transOption, setTransOption] = useState<string | null>(DEFAULT_TRANS_OPTION);
    const [subsequentTargetFunds, setSubsequentTargetFunds] = useState<TargetFundAllocation[] | null>(null);
    const [renewalRequestSignDate, setRenewalRequestSignDate] = useState<string>('');
    // Error information
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [formValidator, setFormValidator] = useState<(val?: renewalsFormParts) => FormValidationErrors>(() => () => {
        return {};
    });

    const [contractValue, setContractValue] = useState<number | string>('');
    const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];

    const [currentFormState, setCurrentFormState] = useState<string>('');
    const isFormStateReadOnly = shouldShowNewExperience ? (action === 'readonly' || (currentFormState !== '' && action !== 'duplicate')) : false;

    return (
        <div>
            <RenewalFormDataContext.Provider
                value={{
                    parties,
                    ownerInformation,
                    channel,
                    transOption,
                    subsequentTargetFunds,
                    renewalRequestSignDate,
                    contractValue,
                    formErrors,
                    caseDocument,
                    currentFormState,
                    setCurrentFormState,
                    isFormStateReadOnly,
                    planCode,
                    featureFlags: featureFlagDecisions,
                    setFormErrors,
                    setContractValue,
                    formValidator,
                    setSubsequentTargetFunds,
                    setTransOption,
                    setOwnerInformation,
                    setChannel,
                    setRenewalRequestSignDate,
                    setFormValidator,
                }}
            >
                {children}
            </RenewalFormDataContext.Provider>
        </div>
    );
};

export default RenewalFormProvider;
