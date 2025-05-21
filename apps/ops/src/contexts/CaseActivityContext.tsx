import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Case, Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { searchPolicy } from '@deps/queries/api/policies';
import { getPolicyQuery, getPolicyQueryKey } from '@deps/queries/tanstack/policyQueries/policyQueries';

export interface CaseActivityContextProps {
    policy: PolicyDetails | null;
    loadingPolicy: boolean;
    isNewBusinessCase: boolean;
}

const defaultValue: CaseActivityContextProps = {
    policy: null,
    loadingPolicy: true,
    isNewBusinessCase: false,
};

export const CaseActivityContext = createContext<CaseActivityContextProps>(defaultValue);

interface CaseActivityProviderProps {
    children: React.ReactNode;
    caseDetails: Case;
}

export const useCaseActivityContext = () => {
    return useContext(CaseActivityContext);
};

const useUniquePolicyGetter = (caseDetails: Case): [Policy | undefined, boolean] => {
    const { data: planCode } = useQuery({
        queryKey: ['policySearch', caseDetails?.policyNumber, caseDetails?.planCode, caseDetails?.additionalData?.planCode],
        queryFn: () => searchPolicy({ policyNumber: caseDetails.policyNumber }),
        enabled: !!caseDetails.policyNumber && !caseDetails.planCode && !caseDetails?.additionalData?.planCode,
        select: val => (val?.results?.length === 1 ? val.results[0].planCode : null),
    });

    const policyPlanCode = planCode ?? caseDetails?.planCode ?? caseDetails?.additionalData?.planCode;

    const { data, isLoading } = useQuery({
        queryKey: [getPolicyQueryKey, caseDetails?.policyNumber, policyPlanCode],
        queryFn: () => getPolicyQuery(caseDetails?.policyNumber as string, policyPlanCode as string),
        enabled: !!caseDetails?.policyNumber && !!policyPlanCode,
    });

    return [data, isLoading];
};

export const CaseActivityProvider = ({ children, caseDetails }: CaseActivityProviderProps) => {
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
            }}
        >
            {children}
        </CaseActivityContext.Provider>
    );
};
