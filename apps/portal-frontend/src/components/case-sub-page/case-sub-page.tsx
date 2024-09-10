'use client';
import { Icon, IconType, TabGroup, TabList, TabTrigger, TabContent } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { toTitleCase } from '@deps/helpers/string.helper';
import { Case } from '@deps/models/case/case';
import { baseAppUrl } from '@deps/queries/api-config';
import { ReactComponent as AnnotationsIcon } from '@deps/styles/elements/icons/communications/annotations.svg';
import { ReactComponent as ProgressIcon } from '@deps/styles/elements/icons/illustrations/check-progress.svg';

import CallLogsTab from './case-tabs.tsx/call-logs-tab';
import DocumentsTab from './case-tabs.tsx/documents-tab';
import NotesTab from './case-tabs.tsx/notes-tab';
import ProgressTab from './case-tabs.tsx/progress-tab';

const TabValues = {
    progress: 'progress',
    documents: 'documents',
    notes: 'notes',
    'call-logs': 'call-logs',
};

export default function CaseSubPage({ caseDetails, tab }: { caseDetails: Case; tab?: string }) {
    const { t } = useTranslation();
    const [tabVal, setTabVal] = useState(tab || TabValues.progress);

    useEffect(() => {
        if (!TabValues?.[tabVal as keyof typeof TabValues]) {
            setTabVal(TabValues.progress);
            window.history.replaceState(window.history.state, '', `${baseAppUrl}/cases/${caseDetails?.id}/${TabValues.progress}`);
        }
    }, [caseDetails?.id, tabVal]);

    const handleTabChange = (val: string) => {
        // We do not want to send the user to a new page, just update the URL in response to a user action
        // https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
        window.history.replaceState(window.history.state, '', `${baseAppUrl}/cases/${caseDetails?.id}/${val}`);
        setTabVal(val);
    };

    return (
        <div className="w-full rounded bg-white shadow-elevation-light-04 lg:w-2/3">
            <TabGroup defaultValue={tabVal} value={tabVal} activationMode="manual" onValueChange={handleTabChange}>
                <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
                    <TabTrigger value={TabValues.progress}>
                        <ProgressIcon width={24} height={24} className="hidden lg:block" />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${TabValues.progress}`) ?? '')}
                    </TabTrigger>
                    <TabTrigger value={TabValues.documents}>
                        <Icon width={24} height={24} className="hidden lg:block" type={IconType.DOCUMENT_TEXT} />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${TabValues.documents}`) ?? '')}
                    </TabTrigger>
                    <TabTrigger value={TabValues.notes}>
                        <AnnotationsIcon width={24} height={24} className="hidden lg:block" />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${TabValues.notes}`) ?? '')}
                    </TabTrigger>
                    <TabTrigger value={TabValues['call-logs']}>
                        <Icon type={IconType.PHONE} width={24} height={24} className="hidden flex-shrink-0 lg:block" />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${TabValues['call-logs']}`) ?? '')}
                    </TabTrigger>
                </TabList>
                <TabContent className="w-full" value={TabValues.progress}>
                    <ProgressTab caseDetails={caseDetails} />
                </TabContent>
                <TabContent className="w-full" value={TabValues.documents}>
                    <DocumentsTab caseDetails={caseDetails} />
                </TabContent>
                <TabContent className="w-full" value={TabValues.notes}>
                    <NotesTab />
                </TabContent>
                <TabContent className="w-full" value={TabValues['call-logs']}>
                    <CallLogsTab />
                </TabContent>
            </TabGroup>
        </div>
    );
}
