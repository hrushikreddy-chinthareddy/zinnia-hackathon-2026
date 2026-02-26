import { createContext, useContext, useState } from 'react';

import { formatSSN } from '@deps/helpers/string.helpers';
import { Case } from '@deps/models/case/case';
import {
    DefaultDataEntryTask,
    RequestType,
} from '@deps/models/case/default-case';
import { UserProfile } from '@deps/models/user-profile';
import { policyOwner } from '@deps/utils/data';
import { IdentificationTypeEnum, Policy } from '@zinnia/api-types/types/sor';

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const defaultCorrespondenceState = {
    defaultCaseData: {} as DefaultDataEntryTask,
    policy: {} as Policy,
    user: {} as UserProfile,
    setDefaultCaseData: noop,
    submitFailed: false,
    setSubmitFailed: noop,
    correlationId: '',
    caseDetails: {} as Case,
    requestType: RequestType.Ops_Service_Request,
};

type DefaultCaseContextProps = {
    defaultCaseData: DefaultDataEntryTask;
    policy?: Policy;
    user: UserProfile;
    submitFailed: boolean;
    setSubmitFailed: React.Dispatch<React.SetStateAction<boolean>>;
    setDefaultCaseData: React.Dispatch<
        React.SetStateAction<DefaultDataEntryTask>
    >;
    correlationId: string;
    caseDetails?: Case;
    requestType: RequestType;
};

export const DefaultCaseContext = createContext<
    DefaultCaseContextProps | undefined
>(defaultCorrespondenceState);

const getCaseDetails = (
    currentData: DefaultDataEntryTask,
    policy: Policy,
    user: UserProfile
): DefaultDataEntryTask => {
    const owner = policyOwner(policy);
    const ssn =
        owner?.identifications?.find(
            (identification) =>
                identification.identificationType === IdentificationTypeEnum.SSN
        )?.identificationValue || undefined;
    return {
        ...currentData,
        caseDetails: {
            ...currentData.caseDetails,
            caseSubType: '',
            lineOfBusiness: policy?.product?.lineOfBusiness || '',
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
    policy?: Policy;
    user: UserProfile;
    correlationId: string;
    taskData: DefaultDataEntryTask;
    caseDetails?: Case;
    requestType: RequestType;
};
export const DefaultCaseProvider = ({
    children,
    policy,
    user,
    correlationId,
    taskData,
    caseDetails,
    requestType,
}: DefaultCaseProviderProps) => {
    const [defaultCaseData, setDefaultCaseData] =
        useState<DefaultDataEntryTask>(
            policy ? getCaseDetails(taskData, policy, user) : taskData
        );

    const [submitFailed, setSubmitFailed] = useState(false);
    return (
        <DefaultCaseContext.Provider
            value={{
                defaultCaseData,
                setDefaultCaseData,
                policy,
                user,
                submitFailed,
                setSubmitFailed,
                correlationId,
                caseDetails,
                requestType,
            }}
        >
            {children}
        </DefaultCaseContext.Provider>
    );
};

export const useDefaultCase = () => {
    const context = useContext(DefaultCaseContext);

    if (!context) {
        throw new Error(
            'useDefaultCase must be used within a DefaultCaseProvider'
        );
    }
    return context;
};
