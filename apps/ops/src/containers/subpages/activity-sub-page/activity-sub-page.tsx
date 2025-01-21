import { TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import CallLogsTab from '@deps/components/case-sub-page/case-tabs/call-logs-tab';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { CallLog } from '@deps/models/case/call-log';
import { getCaseCallLogs } from '@deps/queries/api/contracts';
import { baseAppUrl } from '@deps/queries/api-config';
import { PolicyActivityTabValues } from '@deps/types/constants';

import TransactionsTab from './transactions-tab';

const ActivitySubPage = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'policy.history.filter' });

    const { policy } = useContext(PolicyData);

    const [tabVal, setTabVal] = useState(PolicyActivityTabValues.transactions);

    const [loadingCallLogs, setLoadingCallLogs] = useState(true);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [callLogsStatusCode, setCallLogsStatusCode] = useState<number | null>(null);
    const limit = 10;

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

    useEffect(() => {
        // to do - this doesn't seem like the best way to take whatever is in the url and switch to that tab on load
        if (window.location.pathname.includes('call-logs')) {
            setTabVal(PolicyActivityTabValues['call-logs']);
        }
    }, []);

    const handleTabChange = (val: string) => {
        // We do not want to send the user to a new page, just update the URL in response to a user action
        window.history.replaceState(
            window.history.state,
            '',
            `${baseAppUrl}/policies/${policy.product?.planCode}/${policy.policyNumber}/activity/${val}`
        );
        setTabVal(val);
    };

    return (
        <TabGroup defaultValue={tabVal} value={tabVal} onValueChange={handleTabChange}>
            <TabList>
                <TabTrigger value={PolicyActivityTabValues.transactions}>Transactions</TabTrigger>
                <TabTrigger value={PolicyActivityTabValues['call-logs']}>Call Logs</TabTrigger>
            </TabList>
            <TabContent value={PolicyActivityTabValues.transactions}>
                <TransactionsTab />
            </TabContent>

            <TabContent value={PolicyActivityTabValues['call-logs']}>
                <CallLogsTab loadingCallLogs={loadingCallLogs} callLogs={callLogs} callLogsStatusCode={callLogsStatusCode} />
            </TabContent>
        </TabGroup>
    );
};

export default ActivitySubPage;
