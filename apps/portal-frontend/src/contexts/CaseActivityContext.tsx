import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { DocumentWithSource } from '@deps/containers/subpages/documents-sub-page/documents-sub-page';
import { CallLog } from '@deps/models/case/call-log';
import { Case, Processes } from '@deps/models/case/case';
import { PolicyDocuments } from '@deps/models/case/document';
import { NoteInstance } from '@deps/models/case/note-instance';
import { Policy } from '@deps/models/policy/sor-policy';
import { getCaseNotes } from '@deps/queries/api/cases';
import { getCaseCallLogs } from '@deps/queries/api/contracts';
import { getPolicyDocs, getCorrespondenceDocs } from '@deps/queries/api/documents';
import { findUniquePolicy } from '@deps/queries/api/policies';

export interface CaseActivityContextProps {
    policyDocs: DocumentWithSource[];
    correspondenceDocs: DocumentWithSource[];
    loadingDocuments: boolean;
    caseNotes: NoteInstance[];
    loadingNotes: boolean;
    callLogs: CallLog[];
    loadingCallLogs: boolean;
    policy: Policy | null;
    loadingPolicy: boolean;
    isNewBusinessCase: boolean;
}

const defaultValue: CaseActivityContextProps = {
    policyDocs: [],
    correspondenceDocs: [],
    loadingDocuments: true,
    caseNotes: [],
    loadingNotes: true,
    callLogs: [],
    loadingCallLogs: true,
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
    const [policyDocs, setPolicyDocs] = useState([] as DocumentWithSource[]);
    const [correspondenceDocs, setCorrespondenceDocs] = useState([] as DocumentWithSource[]);
    const [loadingDocuments, setLoadingDocuments] = useState(true);

    const [caseNotes, setCaseNotes] = useState([] as NoteInstance[]);
    const [loadingNotes, setLoadingNotes] = useState(true);

    const [callLogs, setCallLogs] = useState([] as CallLog[]);
    const [loadingCallLogs, setLoadingCallLogs] = useState(true);

    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loadingPolicy, setLoadingPolicy] = useState(true);

    const isNewBusinessCase = useMemo(() => {
        return caseDetails.process === Processes.NewBusiness;
    }, [caseDetails.process]);

    useEffect(() => {
        const getDocs = async () => {
            if (!caseDetails?.policyNumber || !caseDetails?.carrier) {
                setPolicyDocs([]);
                setCorrespondenceDocs([]);
                setLoadingDocuments(false);
                return;
            }
            const [policyDocsReq, correspondenceDocsReq] = await Promise.all([
                getPolicyDocs(caseDetails?.policyNumber, caseDetails?.carrier),
                getCorrespondenceDocs(caseDetails?.policyNumber, caseDetails?.carrier),
            ]);

            if (policyDocsReq?.status == 200) {
                setPolicyDocs(
                    ((policyDocsReq.data as PolicyDocuments)?.items || []).map(item => ({
                        ...item,
                        documentSource: DocumentTypeView.Policy,
                    }))
                );
            }

            if (correspondenceDocsReq?.status == 200) {
                setCorrespondenceDocs(
                    ((correspondenceDocsReq.data as PolicyDocuments)?.items || []).map(item => ({
                        ...item,
                        documentSource: DocumentTypeView.Correspondence,
                    }))
                );
            }

            setLoadingDocuments(false);
        };

        getDocs();
    }, [caseDetails?.policyNumber, caseDetails?.carrier]);

    useEffect(() => {
        const getNotes = async () => {
            if (!caseDetails?.id) {
                setCaseNotes([]);
                setLoadingNotes(false);
                return;
            }
            const notes = await getCaseNotes(caseDetails.id);
            setCaseNotes(notes);
            setLoadingNotes(false);
        };

        getNotes();
    }, [caseDetails?.id]);

    useEffect(() => {
        const getCallLogs = async () => {
            if (caseDetails?.policyNumber) {
                const results = await getCaseCallLogs({ contract: caseDetails.policyNumber, limit: 100, offset: 0 });

                setCallLogs(results?.items || []);
            } else {
                console.error('No contract number associated');
            }
            setLoadingCallLogs(false);
        };

        const getPolicy = async () => {
            const policy: Policy | null = await findUniquePolicy(
                caseDetails?.policyNumber,
                caseDetails?.planCode || caseDetails?.additionalData?.planCode
            );

            setPolicy(policy);
            setLoadingPolicy(false);
        };

        const handlePolicyNumberChange = async () => {
            await Promise.all([getPolicy(), getCallLogs()]);
        };

        handlePolicyNumberChange();
    }, [caseDetails?.policyNumber, caseDetails?.planCode, caseDetails?.additionalData?.planCode]);

    return (
        <CaseActivityContext.Provider
            value={{
                policyDocs,
                correspondenceDocs,
                loadingDocuments,
                caseNotes,
                loadingNotes,
                callLogs,
                loadingCallLogs,
                policy,
                loadingPolicy,
                isNewBusinessCase,
            }}
        >
            {children}
        </CaseActivityContext.Provider>
    );
};
