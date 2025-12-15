import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import { HttpStatusCode } from 'axios';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { StatusBadge } from '@deps/components/status-badge/status-badge';
import Tooltip from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { toSentenceCase, toTitleCase } from '@deps/helpers/string.helpers';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { caseProcessingDetails, Statuses } from '@deps/models/case/case';
import { CaseAction } from '@deps/models/case/enums';
import { PolicyStatus } from '@deps/models/policy/sor-policy';
import { checkCaseQualityAuditEligibility } from '@deps/queries/api/bpm';
import { ReactComponent as Warning } from '@deps/styles/elements/icons/alert/warning.svg';
import { ReactComponent as LeftArrow } from '@deps/styles/elements/icons/arrow/direction-left-3.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import {
    DropdownClickedEvent,
    PolicyClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { browserLogError } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { buildCreateQualityAuditPayload } from './case-helpers';
import CaseActionSideSheet from './caseActionsSideSheet';
import CaseQuickActions from './CaseQuickActions';
import styles from './styles.module.css';
interface CasePageHeaderProps {
    caseId: string;
    status: PolicyStatus | string;
    statusTooltip: string;
    statusVariant: BadgeVariant;
    tag: string;
    title: string;
    escalated: boolean;
    hasPermissionToPrioritizeCases: boolean;
    caseProcessingDetails?: caseProcessingDetails[];
}
type partyDataType = {
    firstName?: string;
    lastName?: string;
    id: string;
};
enum detailTypesEnum {
    ESCALATION = 'ESCALATION',
}
const CasePageHeader = ({
    caseId,
    title,
    tag,
    status,
    statusTooltip,
    statusVariant,
    escalated,
    hasPermissionToPrioritizeCases = false,
    caseProcessingDetails,
}: CasePageHeaderProps) => {
    const { t } = useTranslation();
    const { breadcrumb } = useBreadcrumb();
    const { featureFlags } = useOptimizely();
    const caseTitle = toSentenceCase(title);
    const sideSheet = useSideSheetContext();
    const { sessionId, partyId: userPartyId } = usePermissionsContext();
    const [partyData, setPartyData] = useState<partyDataType>({
        firstName: '',
        lastName: '',
        id: '',
    });
    const { caseDetails } = useCaseActivityContext();
    const [isCaseEligibleForQualityAudit, setIsCaseEligibleForQualityAudit] =
        useState(false);

    const isCasePrioritizationEnabled =
        featureFlags[FEATURE_FLAGS.CASE_PRIORITIZATION];
    const canShowPriorityActions =
        isCasePrioritizationEnabled &&
        hasPermissionToPrioritizeCases &&
        status.toUpperCase() !== Statuses.Canceled &&
        status.toUpperCase() !== Statuses.Completed;

    const prioritizedDate = caseProcessingDetails?.find(
        (d) => d.detailType === detailTypesEnum.ESCALATION
    )?.eventTimeStamp;
    useEffect(() => {
        const fetchPartyData = async () => {
            const partyId = caseProcessingDetails?.find(
                (d) => d.detailType === detailTypesEnum.ESCALATION
            )?.details?.partyId;
            if (!partyId) return;

            try {
                const res = await fetch(
                    '/api/party/v1/parties/reference/batch-get',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            partyIds: [partyId],
                            fields: ['firstName', 'lastName'],
                        }),
                    }
                );
                const data = await res.json();
                setPartyData(data?.parties?.[partyId] ?? []);
            } catch (err) {
                browserLogError(`Error fetching party data: ${err}`);
            }
        };

        fetchPartyData();
    }, [caseProcessingDetails]);

    useEffect(() => {
        const qualityAuditEligibilityPayload =
            buildCreateQualityAuditPayload(caseDetails);
        const fetchQualityAuditEligibility = async () => {
            const response = await checkCaseQualityAuditEligibility(
                qualityAuditEligibilityPayload
            );

            if (response?.status === HttpStatusCode.Ok) {
                setIsCaseEligibleForQualityAudit(true);
            }
        };
        fetchQualityAuditEligibility();
    }, [caseId, caseDetails]);

    const openSideSheet = useCallback(
        (action: CaseAction) => {
            const content = (
                <CaseActionSideSheet action={action} caseId={caseId} />
            );
            sideSheet.changeSideSheetContent(
                t(`caseOverview.${action}Case.title`),
                content
            );
            sideSheet.handleOpen(true);
        },
        [caseId, sideSheet, t]
    );

    const handleCasePrioritize = useCallback(() => {
        openSideSheet(
            escalated ? CaseAction.Deprioritize : CaseAction.Prioritize
        );
    }, [escalated, openSideSheet]);

    const trackClick = (linkName: string, linkUrl: string) => {
        // TODO MG: do we always want to call both of these?
        segmentAnalyticsTrackEvent<DropdownClickedEvent>(
            SegmentTrackedEventName.DropdownClicked,
            {
                dropdownName: 'Policy Quick Actions',
                selectedItemName: linkName,
                authSessionId: sessionId,
                userId: userPartyId,
            }
        );
        segmentAnalyticsTrackEvent<PolicyClickedEvent>(
            SegmentTrackedEventName.PolicyClicked,
            {
                linkName,
                linkUrl,
                authSessionId: sessionId,
                userId: userPartyId,
                caseId,
            }
        );
    };

    return (
        <div className="flex items-center justify-between rounded-t border-b-2 border-gray-100 bg-white pb-4 md:items-center md:pb-8">
            <div className="flex items-center gap-4">
                {breadcrumb?.url && (
                    <Tooltip
                        placement={PopoverPlacement.TopRight}
                        body={breadcrumb?.text}
                        isTabbable={false}
                    >
                        <NavElement
                            aria-label={breadcrumb?.text}
                            href={breadcrumb?.url}
                            size={NavElementSize.Default}
                            startIcon={<LeftArrow height={24} width={24} />}
                            type={NavElementType.Link}
                            className={styles.breadcrumb}
                        />
                    </Tooltip>
                )}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row items-start md:gap-4">
                        <div className="flex flex-col">
                            <div className="flex gap-4 items-center justify-center">
                                <Typography variant={TypographyVariant.H1}>
                                    {toTitleCase(caseTitle || tag)}
                                </Typography>
                                {!!status && !!statusTooltip && (
                                    <Tooltip
                                        triggerClassName="md:mt-2"
                                        placement={PopoverPlacement.TopRight}
                                        body={statusTooltip}
                                    >
                                        <StatusBadge
                                            label={toTitleCase(status)}
                                            variant={statusVariant}
                                        />
                                    </Tooltip>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Typography
                                    className="text-gray-600 my-2 md:mb-0"
                                    variant={TypographyVariant.Body}
                                >
                                    {t('caseOverview.sidenav.caseId', {
                                        caseId:
                                            caseId.length > 0
                                                ? caseId
                                                : DEFAULT_ERROR_STRING,
                                    })}
                                </Typography>
                                {escalated && (
                                    <Tooltip
                                        placement={PopoverPlacement.TopRight}
                                        body={
                                            partyData?.firstName &&
                                            partyData?.lastName
                                                ? t(
                                                      'caseOverview.prioritizeCase.tooltipBody',
                                                      {
                                                          userName:
                                                              partyData.firstName +
                                                              ' ' +
                                                              partyData.lastName,
                                                          date: new Date(
                                                              prioritizedDate as number
                                                          ).toLocaleDateString(),
                                                      }
                                                  )
                                                : t(
                                                      'caseOverview.prioritizeCase.simpleTooltipBody'
                                                  )
                                        }
                                        isTabbable={false}
                                    >
                                        <Badge
                                            className="flex items-center justify-center mt-2 !rounded-md"
                                            label={
                                                (
                                                    <>
                                                        <Warning
                                                            height={16}
                                                            width={16}
                                                        />
                                                        <Typography
                                                            variant={
                                                                TypographyVariant.FieldLabel
                                                            }
                                                        >
                                                            {t(
                                                                'caseOverview.prioritizeCase.prioritized'
                                                            )}
                                                        </Typography>
                                                    </>
                                                ) as unknown as string
                                            }
                                            variant={BadgeVariant.WARNING}
                                        />
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CaseQuickActions
                isCaseEligibleForQualityAudit={isCaseEligibleForQualityAudit}
                escalated={escalated}
                canShowPriorityActions={canShowPriorityActions}
                handleCasePrioritize={handleCasePrioritize}
                caseId={caseId}
                trackClick={trackClick}
            />
        </div>
    );
};

export default CasePageHeader;
