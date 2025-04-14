import { TabContent, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useContext, useState } from 'react';

import CallLogsTab from '@deps/components/case-sub-page/case-tabs/call-logs-tab';
import ActivityPageHeader from '@deps/containers/page-header/activity-page-header';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { baseAppUrl } from '@deps/queries/api-config';
import { PolicyActivityTabValues } from '@deps/types/constants';

import TransactionsTab from './transactions-tab';

const ActivitySubPage = () => {
    const { policy } = useContext(PolicyData);

    const getInitialTabValue = () => {
        let initialTabVal = PolicyActivityTabValues.transactions;
        if (window.location.pathname.includes('call-logs')) {
            initialTabVal = PolicyActivityTabValues['call-logs'];
        }
        return initialTabVal;
    };

    const [tabVal, setTabVal] = useState(getInitialTabValue());

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
        <div className="flex flex-col rounded bg-white">
            <ActivityPageHeader />
            <TabGroup defaultValue={tabVal} value={tabVal} onValueChange={handleTabChange} className="px-8">
                <TabList>
                    <TabTrigger value={PolicyActivityTabValues.transactions}>Transactions</TabTrigger>
                    <TabTrigger value={PolicyActivityTabValues['call-logs']}>Call Logs</TabTrigger>
                </TabList>
                <TabContent value={PolicyActivityTabValues.transactions}>
                    <TransactionsTab />
                </TabContent>

                <TabContent value={PolicyActivityTabValues['call-logs']}>
                    <CallLogsTab queryLimit={10} />
                </TabContent>
            </TabGroup>
        </div>
    );
};

export default ActivitySubPage;
