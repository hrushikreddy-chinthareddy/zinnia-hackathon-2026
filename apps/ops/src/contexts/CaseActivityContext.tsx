import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Case, Processes, Statuses } from '@deps/models/case/case';
import { searchPolicy } from '@deps/queries/api/policies';
import {
    getPolicyQuery,
    getPolicyQueryKey,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { UserTuplesData } from '@deps/types/fga';
import { Policy } from '@zinnia/api-types/types/sor';

export interface CaseActivityContextProps {
    policy: PolicyDetails | null;
    loadingPolicy: boolean;
    isNewBusinessCase: boolean;
    caseDetails: Case;
    userTuplesData: UserTuplesData;
}

const defaultValue: CaseActivityContextProps = {
    policy: null,
    loadingPolicy: true,
    isNewBusinessCase: false,
    caseDetails: {
        id: '',
        policyNumber: '',
        carrier: '',
        additionalData: {},
        caseStatus: Statuses.InProgress,
        createdAt: '',
        documents: [],
        events: [],
        exceptions: [],
        identifiers: [],
        mappedDocuments: [],
        mappedExceptions: [],
        mappedNotes: null,
        mappedTasks: [],
        notes: [],
        parties: [],
        process: Processes.NewBusiness,
        productName: '',
        stages: [],
        tasks: [],
        templateId: '',
        updatedAt: '',
    },
    userTuplesData: {
        tuples: [],
        continuation_token: '',
        continuationToken: '',
    },
};

export const CaseActivityContext =
    createContext<CaseActivityContextProps>(defaultValue);

interface CaseActivityProviderProps {
    children: React.ReactNode;
    caseDetails: Case;
    userTuplesData: UserTuplesData;
}

export const useCaseActivityContext = () => {
    return useContext(CaseActivityContext);
};

const useUniquePolicyGetter = (
    caseDetails: Case
): [Policy | undefined, boolean] => {
    const { data: planCode } = useQuery({
        queryKey: [
            'policySearch',
            caseDetails?.policyNumber,
            caseDetails?.planCode,
            caseDetails?.additionalData?.planCode,
        ],
        queryFn: () => searchPolicy({ policyNumber: caseDetails.policyNumber }),
        enabled:
            !!caseDetails.policyNumber &&
            !caseDetails.planCode &&
            !caseDetails?.additionalData?.planCode,
        select: (val) =>
            val?.results?.length === 1 ? val.results[0].planCode : null,
    });

    const policyPlanCode =
        planCode ??
        caseDetails?.planCode ??
        caseDetails?.additionalData?.planCode;

    const { data, isLoading } = useQuery({
        queryKey: [
            getPolicyQueryKey,
            caseDetails?.policyNumber,
            policyPlanCode,
        ],
        queryFn: () =>
            getPolicyQuery(
                caseDetails?.policyNumber as string,
                policyPlanCode as string
            ),
        enabled: !!caseDetails?.policyNumber && !!policyPlanCode,
    });

    return [data, isLoading];
};

export const CaseActivityProvider = ({
    children,
    caseDetails,
    userTuplesData,
}: CaseActivityProviderProps) => {
    const isNewBusinessCase = useMemo(() => {
        return caseDetails.process === Processes.NewBusiness;
    }, [caseDetails.process]);

    const [data, isLoading] = useUniquePolicyGetter(caseDetails);

    return (
        <CaseActivityContext.Provider
            value={{
                policy: data ? new PolicyDetails(data) : null,
                loadingPolicy: isLoading,
                isNewBusinessCase,
                caseDetails,
                userTuplesData,
            }}
        >
            {children}
        </CaseActivityContext.Provider>
    );
};
