'use client';
import {
    Icon,
    IconType,
    TabGroup,
    TabList,
    TabTrigger,
    TabContent,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { Case } from '@deps/models/case/case';
import {
    CALL_LOGS_TAB_QUERY_LIMIT,
    CaseDetailsTabValues,
} from '@deps/types/constants';
import {
    CaseTabClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';

import CallLogsTab from './case-tabs/call-logs-tab';
import DocumentsTab from './case-tabs/documents-tab';
import NotesTab from './case-tabs/notes-tab';
import Typography, { TypographyVariant } from '../typography/typography';
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
    const { sessionId, partyId } = usePermissionsContext();
    const { policy } = useCaseActivityContext();

    const trackTabClick = (tab: string) => () => {
        segmentAnalyticsTrackEvent<CaseTabClickedEvent>(
            SegmentTrackedEventName.CaseDetailsTabClicked,
            {
                caseId: caseDetails.id,
                session_id: sessionId,
                userId: partyId,
                tabName: tab,
            }
        );
    };

    return (
        <div className="w-full rounded bg-white border-1 border-gray-200 lg:w-2/3">
            <TabGroup
                defaultValue={tab}
                value={tab}
                activationMode="manual"
                onValueChange={handleTabChange}
            >
                <TabList className="!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8">
                    <TabTrigger
                        value={CaseDetailsTabValues.progress}
                        onClick={trackTabClick('Progress')}
                    >
                        <Icon
                            type={IconType.CHECK_PROGRESS}
                            width={20}
                            height={20}
                            className="hidden lg:block"
                        />
                        <Typography variant={TypographyVariant.LabelMdAlt}>
                            {toTitleCase(
                                t(
                                    `caseOverview.tabs.${CaseDetailsTabValues.progress}`
                                ) ?? ''
                            )}
                        </Typography>
                    </TabTrigger>
                    <TabTrigger
                        value={CaseDetailsTabValues.documents}
                        onClick={trackTabClick('Documents')}
                    >
                        <Icon
                            width={20}
                            height={20}
                            className="hidden lg:block"
                            type={IconType.DOCUMENT_TEXT}
                        />
                        <Typography variant={TypographyVariant.LabelMdAlt}>
                            {toTitleCase(
                                t(
                                    `caseOverview.tabs.${CaseDetailsTabValues.documents}`
                                ) ?? ''
                            )}
                        </Typography>
                    </TabTrigger>
                    <TabTrigger
                        value={CaseDetailsTabValues.notes}
                        onClick={trackTabClick('Notes')}
                    >
                        <Icon
                            type={IconType.ANNOTATION}
                            width={20}
                            height={20}
                            className="hidden lg:block"
                        />
                        <Typography variant={TypographyVariant.LabelMdAlt}>
                            {toTitleCase(
                                t(
                                    `caseOverview.tabs.${CaseDetailsTabValues.notes}`
                                ) ?? ''
                            )}
                        </Typography>
                    </TabTrigger>
                    <TabTrigger
                        value={CaseDetailsTabValues['call-logs']}
                        onClick={trackTabClick('Call Logs')}
                    >
                        <Icon
                            type={IconType.PHONE}
                            width={20}
                            height={20}
                            className="hidden flex-shrink-0 lg:block"
                        />
                        <Typography variant={TypographyVariant.LabelMdAlt}>
                            {toTitleCase(
                                t(
                                    `caseOverview.tabs.${CaseDetailsTabValues['call-logs']}`
                                ) ?? ''
                            )}
                        </Typography>
                    </TabTrigger>
                </TabList>
                <TabContent
                    className="w-full"
                    value={CaseDetailsTabValues.progress}
                >
                    <ProgressTab caseDetails={caseDetails} />
                </TabContent>
                <TabContent
                    className="w-full"
                    value={CaseDetailsTabValues.documents}
                >
                    <DocumentsTab caseDetails={caseDetails} policy={policy} />
                </TabContent>
                <TabContent
                    className="w-full"
                    value={CaseDetailsTabValues.notes}
                >
                    <NotesTab caseDetails={caseDetails} />
                </TabContent>
                <TabContent
                    className="w-full"
                    value={CaseDetailsTabValues['call-logs']}
                >
                    <CallLogsTab
                        policyNumber={caseDetails.policyNumber}
                        queryLimit={CALL_LOGS_TAB_QUERY_LIMIT}
                    />
                </TabContent>
            </TabGroup>
        </div>
    );
}
