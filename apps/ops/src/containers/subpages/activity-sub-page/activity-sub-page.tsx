import { TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import CallLogsTab from '@deps/components/case-sub-page/case-tabs/call-logs-tab';
import NotesTab from '@deps/components/case-sub-page/case-tabs/notes-tab';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyActivityTabValues } from '@deps/types/constants';

import TransactionsTab from './transactions-tab';

const ActivitySubPage = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'policy.history.filter' });

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
                {/* to do - pass caseActivityContext as props */}
                <NotesTab />
            </TabContent>
            <TabContent value={PolicyActivityTabValues.callLogs}>
                {/* to do - pass caseActivityContext as props */}
                <CallLogsTab />
            </TabContent>
        </TabGroup>
    );
};

export default ActivitySubPage;
