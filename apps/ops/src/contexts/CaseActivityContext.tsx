import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Case, Processes } from '@deps/models/case/case';
import { findUniquePolicy } from '@deps/queries/api/policies';

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

export const CaseActivityProvider = ({ children, caseDetails }: CaseActivityProviderProps) => {
    const isNewBusinessCase = useMemo(() => {
        return caseDetails.process === Processes.NewBusiness;
    }, [caseDetails.process]);

    const { isLoading, data } = useQuery({
        queryKey: ['uniqueCasePolicy', caseDetails?.policyNumber, caseDetails?.planCode, caseDetails?.additionalData?.planCode],
        queryFn: () => findUniquePolicy(caseDetails?.policyNumber, caseDetails?.planCode || caseDetails?.additionalData?.planCode),
        enabled: !!caseDetails?.policyNumber,
        placeholderData: null,
    });

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
