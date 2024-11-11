import { Button } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { ButtonSize } from '@deps/components/button/button';
import { Loading } from '@deps/components/loading';
import { CaseTypeToProcessesMap } from '@deps/constants/case';
import SearchResultsErrorCard from '@deps/containers/search-results/search-results-error-card/search-results-error-card';
import { isEmptyObject } from '@deps/helpers/objects.helper';
import { useFetchCases } from '@deps/hooks/useFetchCases';
import { Case, CaseType, Statuses } from '@deps/models/case/case';
import { DocumentData } from '@deps/models/case/document';
import createCaseFromDocumentNumber from '@deps/operations/cases/caseOperations';

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
    document: DocumentData | null;
    setShowLoader: Dispatch<SetStateAction<any>>;
    setErrorMessage: Dispatch<SetStateAction<any>>;
}
export const CaseListContainer = ({ t, caseType, policyNumber, clientId, caseId, document, setShowLoader, setErrorMessage }: CaseListContainerProps) => {
    const { cases, total, loading, error, fetchCases, filters, setFilters } = useFetchCases();
    const [selectedCaseData, setSelectedCaseData] = useState<Case | null>(null);
    const [showCreateCase, setShowCreateCase] = useState<boolean>(false);

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

    useEffect(() => {
        const completedCases = cases?.filter(item => item.caseStatus == Statuses.Completed);
        if (completedCases && completedCases.length === total) {
            setShowCreateCase(true);
        }
    }, [cases, setShowCreateCase, total]);

    const caseClickHandler = useCallback(
        (caseData: Case) => {
            if (caseData.id !== selectedCaseData?.id) {
                setSelectedCaseData(caseData);
            }
        },
        [selectedCaseData]
    );

    const onCreateCase = async () => {
        if(!document) return;
        setShowLoader(true)
        const caseResult = await createCaseFromDocumentNumber(
            document.documentNumber,
            document.caseId,
            document.contract,
            caseType,
            clientId
        );

        if (!caseResult.success) {
            console.error('createDocument:: No case id from createCase', {
                documentNumber: document.documentNumber,
                caseType,
                clientId,
            });
            setErrorMessage(t('caseRenewal.caseCreate.createError', { documentNumber: document.documentNumber }) as string);
            setShowLoader(false);
        }
        setShowLoader(false);
    };


    const handleCreateCase = () => {
        onCreateCase();
        if (clientId && caseType) {
            if (policyNumber) {
                setFilters({
                    ...initialCaseSearchCriteria,
                    policyNumber: policyNumber,
                    carrier: [clientId.toUpperCase()],
                    process: [CaseTypeToProcessesMap[caseType]],
                });
            }
        }
    }

    if (error) return <SearchResultsErrorCard />;
    if (total === 0) return <CaseListEmptyState />;

    return (
        <>
            {loading && <Loading />}
            {total ? (
                <div className="flex flex-col" data-testid="case-list-container">
                    {showCreateCase && (
                        <div className="my-3 flex justify-end">
                            <div className="self-center xl:mt-5 xl:self-baseline">
                                <Button
                                    onClick={handleCreateCase}
                                    data-testid="create-case-button"
                                    aria-label={t('caseRenewal.caseCreate.createCase') as string}
                                    size={ButtonSize.Small}
                                >
                                    {t('caseRenewal.caseCreate.createCase')}
                                </Button>
                            </div>
                        </div>
                    )}
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