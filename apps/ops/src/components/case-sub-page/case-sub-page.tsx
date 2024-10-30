'use client';
import { Icon, IconType, TabGroup, TabList, TabTrigger, TabContent } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { toTitleCase } from '@deps/helpers/string.helper';
import { Case } from '@deps/models/case/case';
import { ReactComponent as AnnotationsIcon } from '@deps/styles/elements/icons/communications/annotations.svg';
import { ReactComponent as ProgressIcon } from '@deps/styles/elements/icons/illustrations/check-progress.svg';
import { CaseDetailsTabValues } from '@deps/types/constants';

import CallLogsTab from './case-tabs/call-logs-tab';
import DocumentsTab from './case-tabs/documents-tab';
import NotesTab from './case-tabs/notes-tab';
import ProgressTab from './case-tabs/progress/progress-tab';

export default function CaseSubPage({
    caseDetails,
    tab,
    handleTabChange,
}: {
    caseDetails: Case;
    tab?: string;
    handleTabChange: (val: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="w-full rounded bg-white shadow-elevation-light-04 lg:w-2/3">
            <TabGroup defaultValue={tab} value={tab} activationMode="manual" onValueChange={handleTabChange}>
                <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
                    <TabTrigger value={CaseDetailsTabValues.progress}>
                        <ProgressIcon width={24} height={24} className="hidden lg:block" />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${CaseDetailsTabValues.progress}`) ?? '')}
                    </TabTrigger>
                    <TabTrigger value={CaseDetailsTabValues.documents}>
                        <Icon width={24} height={24} className="hidden lg:block" type={IconType.DOCUMENT_TEXT} />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${CaseDetailsTabValues.documents}`) ?? '')}
                    </TabTrigger>
                    <TabTrigger value={CaseDetailsTabValues.notes}>
                        <AnnotationsIcon width={24} height={24} className="hidden lg:block" />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${CaseDetailsTabValues.notes}`) ?? '')}
                    </TabTrigger>
                    <TabTrigger value={CaseDetailsTabValues['call-logs']}>
                        <Icon type={IconType.PHONE} width={24} height={24} className="hidden flex-shrink-0 lg:block" />{' '}
                        {toTitleCase(t(`caseOverview.tabs.${CaseDetailsTabValues['call-logs']}`) ?? '')}
                    </TabTrigger>
                </TabList>
                <TabContent className="w-full" value={CaseDetailsTabValues.progress}>
                    <ProgressTab caseDetails={caseDetails} />
                </TabContent>
                <TabContent className="w-full" value={CaseDetailsTabValues.documents}>
                    <DocumentsTab caseDetails={caseDetails} />
                </TabContent>
                <TabContent className="w-full" value={CaseDetailsTabValues.notes}>
                    <NotesTab />
                </TabContent>
                <TabContent className="w-full" value={CaseDetailsTabValues['call-logs']}>
                    <CallLogsTab />
                </TabContent>
            </TabGroup>
        </div>
    );
}
