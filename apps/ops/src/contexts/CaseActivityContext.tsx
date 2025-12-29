import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useMemo } from 'react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Case, LOADING_TIME_CONFIG, Processes } from '@deps/models/case/case';
import { FinancialTransactionRecord } from '@deps/models/case/financial-transactions';
import { searchPolicy } from '@deps/queries/api/policies';
import {
    getPolicyQuery,
    getPolicyQueryKey,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { Policy } from '@zinnia/api-types/types/sor';

import { useOptimizely } from './OptimizelyContext';

export interface CaseActivityContextProps {
    policy: PolicyDetails | null;
    loadingPolicy: boolean;
    isNewBusinessCase: boolean;
    financialTransaction?: FinancialTransactionRecord;
    financialTransactionLoading: boolean;
    isFinancialTransaction: boolean;
}

const defaultValue: CaseActivityContextProps = {
    policy: null,
    loadingPolicy: true,
    isNewBusinessCase: false,
    financialTransaction: undefined,
    financialTransactionLoading: true,
    isFinancialTransaction: false,
};

export const CaseActivityContext =
    createContext<CaseActivityContextProps>(defaultValue);

interface CaseActivityProviderProps {
    children: React.ReactNode;
    caseDetails: Case;
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

const useFinancialTransaction = (
    caseDetails: Case
): [FinancialTransactionRecord | undefined, boolean, boolean] => {
    const { featureFlags } = useOptimizely();

    const transactionRecord = caseDetails?.caseAdditionalData?.find(
        (item) => item.entityType === 'FI_MONEY_IN_TRANSACTION_RECORD'
    );

    const isFinancialTransaction =
        !!transactionRecord &&
        !!featureFlags[FEATURE_FLAGS.FINANCIAL_TRANSACTION];

    const { data: financialTransaction, isLoading } = useQuery({
        queryKey: ['financialTransaction', transactionRecord?.id],
        queryFn: () => getTransactionEntityQuery(transactionRecord?.id),
        refetchInterval: LOADING_TIME_CONFIG.ORGANIZING_THRESHOLD,

        enabled: isFinancialTransaction,
    });

    return [financialTransaction, isLoading, isFinancialTransaction];
};

export const CaseActivityProvider = ({
    children,
    caseDetails,
}: CaseActivityProviderProps) => {
    const isNewBusinessCase = useMemo(() => {
        return caseDetails.process === Processes.NewBusiness;
    }, [caseDetails.process]);

    const [data, isLoading] = useUniquePolicyGetter(caseDetails);
    const [
        financialTransaction,
        financialTransactionLoading,
        isFinancialTransaction,
    ] = useFinancialTransaction(caseDetails);
    return (
        <CaseActivityContext.Provider
            value={{
                policy: data ? new PolicyDetails(data) : null,
                loadingPolicy: isLoading,
                isNewBusinessCase,
                financialTransaction,
                financialTransactionLoading,
                isFinancialTransaction,
            }}
        >
            {children}
        </CaseActivityContext.Provider>
    );
};
