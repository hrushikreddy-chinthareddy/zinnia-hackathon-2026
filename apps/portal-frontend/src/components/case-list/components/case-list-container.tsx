import { TFunction } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import { Loading } from '@deps/components/loading';
import { CaseTypeToProcessesMap } from '@deps/constants/case';
import SearchResultsErrorCard from '@deps/containers/search-results/search-results-error-card/search-results-error-card';
import { isEmptyObject } from '@deps/helpers/objects.helper';
import { useFetchCases } from '@deps/hooks/useFetchCases';
import { Case, CaseType } from '@deps/models/case/case';

import { CaseListControls } from './case-list-controls';
import { CaseListEmptyState } from './case-list-empty-state';
import { CaseListItem } from './case-list-item';
import { initialCaseSearchCriteria } from '../helpers/const';

export interface CaseListContainerProps {
    t: TFunction;
    caseType: CaseType;
    clientId: string;
    policyNumber: string;
    caseId: string;
}
export const CaseListContainer = ({ t, caseType, policyNumber, clientId, caseId }: CaseListContainerProps) => {
    const { cases, total, loading, error, fetchCases, filters, setFilters } = useFetchCases();
    const [selectedCaseData, setSelectedCaseData] = useState<Case | null>(null);

    useEffect(() => {
        if (clientId && caseType) {
            if (policyNumber) {
                setFilters({
                    ...initialCaseSearchCriteria,
                    policyNumber: policyNumber,
                    carrier: [clientId.toUpperCase()],
                    process: [CaseTypeToProcessesMap[caseType]],
                });
            }
            if (!policyNumber && caseId) {
                setFilters({
                    ...initialCaseSearchCriteria,
                    caseIds: [caseId],
                    carrier: [clientId.toUpperCase()],
                    process: [CaseTypeToProcessesMap[caseType]],
                });
            }
        }
    }, [policyNumber, clientId, caseType, setFilters, caseId]);

    useEffect(() => {
        if (!isEmptyObject(filters)) {
            setSelectedCaseData(null);
            fetchCases();
        }
    }, [filters, fetchCases]);

    const caseClickHandler = useCallback(
        (caseData: Case) => {
            if (caseData.id !== selectedCaseData?.id) {
                setSelectedCaseData(caseData);
            }
        },
        [selectedCaseData]
    );


    if (error) return <SearchResultsErrorCard />;
    if (total === 0) return <CaseListEmptyState />;
    return (
        <>
            {loading && <Loading />}
            {total ? (
                <div className="flex flex-col" data-testid="case-list-container">
                    <div className="mt-2 w-full xs:overflow-x-auto xs:overflow-y-hidden xs:p-1 lg:p-0">
                        {cases?.map((item, index) => (
                            <CaseListItem
                                t={t}
                                index={index}
                                key={item.id}
                                caseData={item}
                                selectedCaseId={selectedCaseData?.id}
                                caseType={caseType}
                                clientId={clientId}
                                onCaseClick={caseClickHandler}
                            ></CaseListItem>
                        ))}
                    </div>
                    <CaseListControls total={total} filters={filters} setFilters={setFilters}></CaseListControls>
                </div>
            ) : null}
        </>
    );
};
