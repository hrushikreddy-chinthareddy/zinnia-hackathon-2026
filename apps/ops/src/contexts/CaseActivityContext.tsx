import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { CallLog } from '@deps/models/case/call-log';
import { Case, Processes } from '@deps/models/case/case';
import { NoteInstance } from '@deps/models/case/note-instance';
import { Policy } from '@deps/models/policy/sor-policy';
import { getCaseNotes } from '@deps/queries/api/cases';
import { getCaseCallLogs } from '@deps/queries/api/contracts';
import { findUniquePolicy } from '@deps/queries/api/policies';

export interface CaseActivityContextProps {
    caseNotes: NoteInstance[];
    loadingNotes: boolean;
    notesStatusCode: number | null;
    callLogs: CallLog[];
    loadingCallLogs: boolean;
    callLogsStatusCode: number | null;
    policy: PolicyDetails | null;
    loadingPolicy: boolean;
    isNewBusinessCase: boolean;
}

const defaultValue: CaseActivityContextProps = {
    caseNotes: [],
    loadingNotes: true,
    notesStatusCode: null,
    callLogs: [],
    loadingCallLogs: true,
    callLogsStatusCode: null,
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
    const [caseNotes, setCaseNotes] = useState([] as NoteInstance[]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [notesStatusCode, setNotesStatusCode] = useState<number | null>(null);

    const [callLogs, setCallLogs] = useState([] as CallLog[]);
    const [loadingCallLogs, setLoadingCallLogs] = useState(true);
    const [callLogsStatusCode, setCallLogsStatusCode] = useState<number | null>(null);

    const [policy, setPolicy] = useState<PolicyDetails | null>(null);
    const [loadingPolicy, setLoadingPolicy] = useState(true);

    const isNewBusinessCase = useMemo(() => {
        return caseDetails.process === Processes.NewBusiness;
    }, [caseDetails.process]);

    useEffect(() => {
        const getNotes = async () => {
            if (!caseDetails?.id) {
                setCaseNotes([]);
                setLoadingNotes(false);
                return;
            }
            const { data: notes, status } = await getCaseNotes(caseDetails.id);
            setCaseNotes(notes);
            setLoadingNotes(false);
            setNotesStatusCode(status);
        };

        getNotes();
    }, [caseDetails?.id]);

    useEffect(() => {
        const getCallLogs = async () => {
            if (caseDetails?.policyNumber) {
                const callLogsResponse = await getCaseCallLogs({ contract: caseDetails.policyNumber, limit: 100, offset: 0 });

                setCallLogs(callLogsResponse?.data?.items || []);
                setCallLogsStatusCode(callLogsResponse?.status);
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

            setPolicy(policy ? new PolicyDetails(policy) : null);
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
                caseNotes,
                loadingNotes,
                notesStatusCode,
                callLogs,
                loadingCallLogs,
                callLogsStatusCode,
                policy,
                loadingPolicy,
                isNewBusinessCase,
            }}
        >
            {children}
        </CaseActivityContext.Provider>
    );
};
