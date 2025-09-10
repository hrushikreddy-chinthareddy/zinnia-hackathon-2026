import React, { useState } from 'react';

import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import {
    OwnerInformation,
    TargetFundAllocation,
    renewalsFormParts,
} from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    CaseStatus,
    FormValidationErrors,
} from '@deps/models/case/withdrawal/case';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import { DEFAULT_TRANS_OPTION, getOwnerInfo } from './renewal-form-helpers';

interface RenewalFormProviderProps {
    children: React.ReactNode;
    document: DocumentData;
    parties: LifeCadParty[];
    userId: string;
    action: string;
    featureFlagDecisions: FeatureFlags;
    planCode: string;
    form: any;
    initialForm: any;
}

export interface UpfrontNIGO {
    nigos: {
        exceptionId: string;
        messages: string[];
    }[];
}

function merge(a: any[], b: any[], prop: string) {
    const reduced = a.filter(
        (aitem) => !b.find((bitem) => aitem[prop] === bitem[prop])
    );
    return reduced.concat(b);
}

const RenewalFormProvider = ({
    children,
    parties,
    document,
    action,
    featureFlagDecisions,
    planCode,
    form,
}: RenewalFormProviderProps) => {
    const [channel, setChannel] = useState<Channel>(
        form?.data?.channel ?? Channel.Form
    );
    const owners = parties?.filter((party) => party.SrcRoleType === 0) || [];

    const inputOwnerInfo = form?.data?.ownerInformation || [];
    const existingOwnerInfo = getOwnerInfo(owners) || [];
    const ownerInfo = merge(existingOwnerInfo, inputOwnerInfo, 'type');

    const [ownerInformation, setOwnerInformation] =
        useState<OwnerInformation[]>(ownerInfo);
    const [transOption, setTransOption] = useState<string | null>(
        form?.data?.transOption || DEFAULT_TRANS_OPTION
    );
    const [subsequentTargetFunds, setSubsequentTargetFunds] = useState<
        TargetFundAllocation[] | null
    >(form?.data?.subsequentTargetFunds || null);
    const [renewalRequestSignDate, setRenewalRequestSignDate] =
        useState<string>(form?.data?.renewalRequestSignDate ?? '');
    // Error information
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [formValidator, setFormValidator] = useState<
        (val?: renewalsFormParts) => FormValidationErrors
    >(() => () => {
        return {};
    });

    const [contractValue, setContractValue] = useState<number | string>(
        form?.data?.contractNum ?? ''
    );
    const shouldShowNewExperience =
        featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];

    const [currentFormState, setCurrentFormState] = useState(form.status ?? '');
    const isFormStateReadOnly = shouldShowNewExperience
        ? action === 'readonly' ||
          (currentFormState !== CaseStatus.Pending &&
              currentFormState !== TaskStatus.New &&
              currentFormState !== TaskStatus.InProgress)
        : false;

    const [upfrontNIGO, setUpfrontNIGO] = useState<UpfrontNIGO>(
        form?.data?.upfrontNIGO ?? null
    );

    return (
        <div>
            <RenewalFormDataContext.Provider
                value={{
                    initialForm: form,
                    parties,
                    ownerInformation,
                    channel,
                    transOption,
                    subsequentTargetFunds,
                    renewalRequestSignDate,
                    contractValue,
                    formErrors,
                    document,
                    currentFormState,
                    setCurrentFormState,
                    isFormStateReadOnly,
                    planCode,
                    featureFlags: featureFlagDecisions,
                    upfrontNIGO,
                    setUpfrontNIGO,
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
