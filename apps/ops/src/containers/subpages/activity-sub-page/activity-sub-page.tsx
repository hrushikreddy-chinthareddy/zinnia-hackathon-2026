import { TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import CallLogsTab from '@deps/components/case-sub-page/case-tabs/call-logs-tab';
import NotesTab from '@deps/components/case-sub-page/case-tabs/notes-tab';
import { TranslationFiles } from '@deps/config/translations';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useDiaryNotes } from '@deps/hooks/useDiaryNotes';
import { CallLog } from '@deps/models/case/call-log';
import { NoteInstance } from '@deps/models/case/note-instance';
import { getCaseCallLogs } from '@deps/queries/api/contracts';
import { PolicyActivityTabValues } from '@deps/types/constants';

import TransactionsTab from './transactions-tab';

const ActivitySubPage = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'policy.history.filter' });

    // to do - swap these over from case context to policy
    const { notesStatusCode } = useCaseActivityContext();
    const { policy } = useContext(PolicyData);

    const [loadingCallLogs, setLoadingCallLogs] = useState(true);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [callLogsStatusCode, setCallLogsStatusCode] = useState<number | null>(null);
    const limit = 10;

    const diaryNotesData = useDiaryNotes(policy.policyNumber as string, policy.carrierId as string, 0, 10);
    // to do - this is obviously not the correct type - just casting it so I can push
    const caseNotes = diaryNotesData.diaryNotes as unknown as NoteInstance[];
    const loadingNotes = diaryNotesData.isLoading;
    // const notestatusCode = diaryNotesData.notesStatusCode;

    useEffect(() => {
        const getCallLogs = async () => {
            if (policy.policyNumber) {
                const results = await getCaseCallLogs({ contract: policy.policyNumber, offset: 0, limit });

                setCallLogs(results?.data?.items || []);
                setCallLogsStatusCode(results?.status);
            } else {
                console.error('No contract number associated');
            }
            setLoadingCallLogs(false);
        };

        getCallLogs();
    }, [policy.policyNumber]);

    return (
        <TabGroup defaultValue={PolicyActivityTabValues.transactions}>
            <TabList>
                <TabTrigger value={PolicyActivityTabValues.transactions}>Transactions</TabTrigger>
                <TabTrigger value={PolicyActivityTabValues.notes}>Notes</TabTrigger>
                <TabTrigger value={PolicyActivityTabValues.callLogs}>Call Logs</TabTrigger>
            </TabList>
            <TabContent value={PolicyActivityTabValues.transactions}>
                <TransactionsTab />
            </TabContent>
            <TabContent value={PolicyActivityTabValues.notes}>
                <NotesTab caseNotes={caseNotes} loadingNotes={loadingNotes} notesStatusCode={notesStatusCode} />
            </TabContent>
            <TabContent value={PolicyActivityTabValues.callLogs}>
                <CallLogsTab loadingCallLogs={loadingCallLogs} callLogs={callLogs} callLogsStatusCode={callLogsStatusCode} />
            </TabContent>
        </TabGroup>
    );
};

export default ActivitySubPage;
