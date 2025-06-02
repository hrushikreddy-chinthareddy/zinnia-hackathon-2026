import { IdentificationType, Policy } from '@xd/api-types/dist/generated-types/sor';
import { policyOwner } from '@xd/utils/dist';
import { createContext, useContext, useState } from 'react';

import { formatSSN } from '@deps/helpers/string.helpers';
import { DefaultDataEntryTask } from '@deps/models/case/default-case';
import { UserProfile } from '@deps/models/user-profile';

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const defaultCorrespondenceState = {
    defaultCaseData: {} as DefaultDataEntryTask,
    policy: {} as Policy,
    user: {} as UserProfile,
    setDefaultCaseData: noop,
    submitFailed: false,
    setSubmitFailed: noop,
    correlationId: '',
};

type DefaultCaseContextProps = {
    defaultCaseData: DefaultDataEntryTask;
    policy: Policy;
    user: UserProfile;
    submitFailed: boolean;
    setSubmitFailed: React.Dispatch<React.SetStateAction<boolean>>;
    setDefaultCaseData: React.Dispatch<React.SetStateAction<DefaultDataEntryTask>>;
    correlationId: string;
};

export const DefaultCaseContext = createContext<DefaultCaseContextProps | undefined>(defaultCorrespondenceState);

const getCaseDetails = (policy: Policy, user: UserProfile): DefaultDataEntryTask => {
    const owner = policyOwner(policy);
    const ssn =
        owner?.identifications?.find(identification => identification.identificationType === IdentificationType.SSN)?.identificationValue ||
        undefined;
    return {
        caseDetails: {
            caseType: '',
            caseSubType: '',
            contractNumber: policy?.policyNumber || '',
            carrier: policy?.carrierId || '',
            customerDetails: {
                firstName: owner?.firstName || '',
                lastName: owner?.lastName || '',
                taxId: formatSSN(ssn),
                payorId: '',
            },
            callDetails: {
                callerRole: '',
                associateName: user?.name || '',
                callerName: '',
                callerPhone: '',
            },
        },
        attachments: [],
    } as DefaultDataEntryTask;
};
type DefaultCaseProviderProps = {
    children: React.ReactNode;
    policy: Policy;
    user: UserProfile;
    correlationId: string;
};
export const DefaultCaseProvider = ({ children, policy, user, correlationId }: DefaultCaseProviderProps) => {
    const [defaultCaseData, setDefaultCaseData] = useState<DefaultDataEntryTask>(getCaseDetails(policy, user));
    const [submitFailed, setSubmitFailed] = useState(false);
    return (
        <DefaultCaseContext.Provider
            value={{ defaultCaseData, setDefaultCaseData, policy, user, submitFailed, setSubmitFailed, correlationId }}
        >
            {children}
        </DefaultCaseContext.Provider>
    );
};

export const useDefaultCase = () => {
    const context = useContext(DefaultCaseContext);

    if (!context) {
        throw new Error('useDefaultCase must be used within a DefaultCaseProvider');
    }
    return context;
};
