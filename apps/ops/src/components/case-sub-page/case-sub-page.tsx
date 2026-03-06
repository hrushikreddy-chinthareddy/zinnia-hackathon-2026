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

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { usePolicyDataContext } from '@deps/contexts/PolicyDataContext';
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
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import ActivityFeedTab from './case-tabs/activity-feed';
import CallLogsTab from './case-tabs/call-logs-tab';
import DocumentsTab from './case-tabs/documents-tab';
import EventsTab from './case-tabs/events-tab';
import NotesTab from './case-tabs/notes-tab';
import Typography, { TypographyVariant } from '../typography/typography';
import ProgressTab from './case-tabs/progress/progress-tab';
import RawDataTab from './case-tabs/raw-data-tab';

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
    const {
        sessionId,
        partyId,
        hasCallLogsAccess,
        hasNotesAccess,
        isZinniaInternalViewer,
    } = usePermissionsContext();
    const { policy } = usePolicyDataContext();
    const { featureFlags } = useOptimizely();

    const canViewRawData =
        isZinniaInternalViewer && featureFlags[FEATURE_FLAGS.SHOW_RAW_DATA];
    const canViewCaseEvents = featureFlags[FEATURE_FLAGS.SHOW_CASE_EVENTS];
    const canViewActivityFeed =
        featureFlags[FEATURE_FLAGS.CAN_VIEW_ACTIVITY_FEED];

    const canViewTechnicalExceptions = String(
        featureFlags[FEATURE_FLAGS.CAN_VIEW_CASE_TECHNICAL_EXCEPTIONS]
    );

    if (!caseDetails?.additionalData?.canViewTechnicalExceptions) {
        caseDetails.additionalData = {
            ...caseDetails.additionalData,
            canViewTechnicalExceptions,
        };
    }

    const trackTabClick = (tab: string) => () => {
        segmentAnalyticsTrackEvent<CaseTabClickedEvent>(
            SegmentTrackedEventName.CaseDetailsTabClicked,
            {
                caseId: caseDetails.id,
                authSessionId: sessionId,
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
                    {canViewActivityFeed && (
                        <TabTrigger
                            value={CaseDetailsTabValues.activity}
                            onClick={trackTabClick('Activity')}
                        >
                            <Icon
                                type={IconType.SETTINGS}
                                width={20}
                                height={20}
                                className="hidden lg:block"
                            />
                            <Typography variant={TypographyVariant.LabelMdAlt}>
                                {toTitleCase(t('allFields.activity') ?? '')}
                            </Typography>
                        </TabTrigger>
                    )}
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
                    {hasNotesAccess && (
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
                    )}
                    {hasCallLogsAccess && (
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
                    )}
                    {canViewCaseEvents && (
                        <TabTrigger
                            value={CaseDetailsTabValues.events}
                            onClick={trackTabClick('Events')}
                        >
                            <Icon
                                type={IconType.HISTORY_EVENT}
                                width={20}
                                height={20}
                                className="hidden flex-shrink-0 lg:block"
                            />
                            <Typography variant={TypographyVariant.LabelMdAlt}>
                                {toTitleCase(
                                    t(
                                        `caseOverview.tabs.${CaseDetailsTabValues.events}`
                                    ) ?? ''
                                )}
                            </Typography>
                        </TabTrigger>
                    )}
                    {canViewRawData && (
                        <TabTrigger
                            value={CaseDetailsTabValues['raw-data']}
                            onClick={trackTabClick('Raw Data')}
                        >
                            <Icon
                                type={IconType.DATABASE}
                                width={20}
                                height={20}
                                className="hidden flex-shrink-0 lg:block"
                            />
                            <Typography variant={TypographyVariant.LabelMdAlt}>
                                {toTitleCase(
                                    t(
                                        `caseOverview.tabs.${CaseDetailsTabValues['raw-data']}`
                                    ) ?? ''
                                )}
                            </Typography>
                        </TabTrigger>
                    )}
                </TabList>
                <TabContent
                    className="w-full"
                    value={CaseDetailsTabValues.progress}
                >
                    <ProgressTab caseDetails={caseDetails} />
                </TabContent>
                {canViewActivityFeed && (
                    <TabContent
                        className="w-full"
                        value={CaseDetailsTabValues.activity}
                    >
                        <ActivityFeedTab caseDetails={caseDetails} />
                    </TabContent>
                )}
                <TabContent
                    className="w-full"
                    value={CaseDetailsTabValues.documents}
                >
                    <DocumentsTab caseDetails={caseDetails} policy={policy} />
                </TabContent>
                {hasNotesAccess && (
                    <TabContent
                        className="w-full"
                        value={CaseDetailsTabValues.notes}
                    >
                        <NotesTab caseDetails={caseDetails} />
                    </TabContent>
                )}
                {hasCallLogsAccess && (
                    <TabContent
                        className="w-full"
                        value={CaseDetailsTabValues['call-logs']}
                    >
                        <CallLogsTab
                            policyNumber={caseDetails.policyNumber}
                            queryLimit={CALL_LOGS_TAB_QUERY_LIMIT}
                        />
                    </TabContent>
                )}
                {canViewCaseEvents && (
                    <TabContent
                        className="w-full"
                        value={CaseDetailsTabValues.events}
                    >
                        <EventsTab caseDetails={caseDetails} />
                    </TabContent>
                )}
                {canViewRawData && (
                    <TabContent
                        className="w-full"
                        value={CaseDetailsTabValues['raw-data']}
                    >
                        <RawDataTab caseDetails={caseDetails} />
                    </TabContent>
                )}
            </TabGroup>
        </div>
    );
}
