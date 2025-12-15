import { useMutation } from '@tanstack/react-query';
import { Toast, ToastVariant } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import { NavElementType } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { TextButton } from '@deps/components/quick-actions-menu/quick-action-text-button';
import Tooltip from '@deps/components/tooltip/tooltip';
import { TranslationFiles } from '@deps/config/translations';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import {
    FNWL_QUALITY_AUDIT_REVIEW_QUEUE_ADMIN,
    FNWL_QUALITY_AUDIT_REVIEW_QUEUE_PROCESSOR,
} from '@deps/helpers/case-stat-helpers';
import { QualityAuditStatus } from '@deps/models/case/case';
import { INTERVAL } from '@deps/models/case/task';
import { createQualityAuditForCaseIdQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { UserTuple } from '@deps/types/fga';
import {
    CreateQualityAuditRequest,
    CreateQualityAuditResponse,
} from '@deps/types/search';

import { buildCreateQualityAuditPayload } from './case-helpers';

type QualityAuditOption = {
    id:
        | 'createQualityAudit'
        | 'prioritizeCase'
        | 'deprioritizeCase'
        | 'operationsReviewRequest';
    name: string;
    hideLabel: boolean;
    isEligible: boolean;
    shouldShow: boolean;
    tooltip?: string | null;
    href?: string;
    openInNewTab?: boolean;
};

type CaseQuickActionsProps = {
    isCaseEligibleForQualityAudit: boolean;
    escalated: boolean;
    canShowPriorityActions: boolean;
    handleCasePrioritize: () => void;
    caseId: string;
    trackClick: (linkName: string, linkUrl: string) => void;
};

const CaseQuickActions: React.FC<CaseQuickActionsProps> = ({
    isCaseEligibleForQualityAudit,
    escalated,
    handleCasePrioritize,
    canShowPriorityActions,
    caseId,
    trackClick,
}) => {
    const { t } = useTranslation();
    const { t: quickLinksT } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'quickActions',
    });
    const { caseDetails, userTuplesData } = useCaseActivityContext();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastVariant, setToastVariant] = useState<ToastVariant | null>(null);
    const [isQualityAuditCreated, setIsQualityAuditCreated] = useState(false);
    const { isAllowOpsCaseReviewRequest } = usePermissionsContext();

    useEffect(() => {
        if (toastMessage && toastVariant) {
            const timer = setTimeout(() => {
                setToastMessage('');
                setToastVariant(null);
            }, INTERVAL);
            return () => clearTimeout(timer);
        }
    }, [toastMessage, toastVariant]);

    const allowedPermissions = [
        FNWL_QUALITY_AUDIT_REVIEW_QUEUE_ADMIN,
        FNWL_QUALITY_AUDIT_REVIEW_QUEUE_PROCESSOR,
    ];

    const hasQualityAuditAdminPermission = userTuplesData?.tuples?.some(
        (tuple: UserTuple) =>
            allowedPermissions.some((permission) =>
                tuple?.key?.object.includes(permission)
            )
    );

    const qualityAuditPayload = buildCreateQualityAuditPayload(caseDetails);

    const { mutate } = useMutation({
        mutationFn: async (qualityAuditPayload: CreateQualityAuditRequest) => {
            return await createQualityAuditForCaseIdQuery(qualityAuditPayload);
        },
        onSuccess: (response: CreateQualityAuditResponse) => {
            const qualityAuditCode = response?.data?.code as
                | QualityAuditStatus
                | undefined;
            if (
                qualityAuditCode &&
                [
                    QualityAuditStatus.QA_CASE_ALREADY_EXISTS,
                    QualityAuditStatus.QA_CASE_CREATED,
                ].includes(qualityAuditCode)
            ) {
                setIsQualityAuditCreated(true);
                setToastVariant(ToastVariant.Success);
                setToastMessage(
                    t(
                        'caseOverview.qualityAuditToastMessages.qualityAuditSuccess'
                    )
                );
            }
        },
        onError: () => {
            setToastVariant(ToastVariant.Error);
            setToastMessage(
                t('caseOverview.qualityAuditToastMessages.qualityAuditError')
            );
        },
    });

    const isQualityAuditEligible =
        hasQualityAuditAdminPermission && isCaseEligibleForQualityAudit;

    const qualityAuditOptions: QualityAuditOption[] = [
        {
            id: 'createQualityAudit',
            name: t('caseOverview.quickActions.createQualityAudit'),
            hideLabel: false,
            isEligible: isQualityAuditEligible,
            shouldShow: hasQualityAuditAdminPermission,
            tooltip: !isCaseEligibleForQualityAudit
                ? t('caseOverview.quickActions.caseIsNotEligible')
                : isQualityAuditCreated
                ? t('caseOverview.quickActions.qualityAuditExisted')
                : isQualityAuditEligible
                ? t('caseOverview.quickActions.createQualityAuditTooltip')
                : t(
                      'caseOverview.quickActions.createQualityAuditTooltipDisabled'
                  ),
            href: '',
        },
        {
            id: 'prioritizeCase',
            name: t('caseOverview.prioritizeCase.title'),
            hideLabel: false,
            isEligible: true,
            shouldShow: canShowPriorityActions && !escalated,
        },
        {
            id: 'deprioritizeCase',
            name: t('caseOverview.deprioritizeCase.title'),
            hideLabel: false,
            isEligible: true,
            shouldShow: canShowPriorityActions && escalated,
        },
        {
            id: 'operationsReviewRequest',
            name: quickLinksT('requestOperationReview.label'),
            hideLabel: false,
            isEligible: true,
            shouldShow: isAllowOpsCaseReviewRequest,
            href: `/cases/${caseId}/operations-review`,
            openInNewTab: true,
        },
    ];

    const handleQuickActionsMethods = (option: QualityAuditOption) => {
        switch (option.id) {
            case 'createQualityAudit':
                mutate(qualityAuditPayload);
                break;

            case 'prioritizeCase':
            case 'deprioritizeCase':
                handleCasePrioritize();
                break;
            case 'operationsReviewRequest':
                trackClick(
                    'Raise a Service Request',
                    option?.href || `/cases/${caseId}/operations-review`
                );
                break;

            default:
                break;
        }
    };

    return (
        <>
            <MenuContextual
                trigger={
                    <TextButton
                        label={t('caseOverview.quickActions.quickActions')}
                    />
                }
            >
                {qualityAuditOptions
                    .filter((option) => option.shouldShow)
                    .map((option) => {
                        return option?.tooltip ? (
                            <Tooltip
                                key={option.id}
                                placement={PopoverPlacement.TopLeft}
                                body={option.tooltip}
                                isTabbable={false}
                                popoverClassName="md:mb-5"
                            >
                                <MenuContextualItem
                                    key={option.id}
                                    content={option.name}
                                    href={option.href}
                                    disabled={!option.isEligible}
                                    onClick={() =>
                                        handleQuickActionsMethods(option)
                                    }
                                    type={
                                        option?.href
                                            ? NavElementType.Link
                                            : NavElementType.Button
                                    }
                                    openInNewTab={option?.openInNewTab}
                                />
                            </Tooltip>
                        ) : (
                            <MenuContextualItem
                                key={option.id}
                                content={option.name}
                                href={option.href}
                                disabled={!option.isEligible}
                                onClick={() =>
                                    handleQuickActionsMethods(option)
                                }
                                type={
                                    option?.href
                                        ? NavElementType.Link
                                        : NavElementType.Button
                                }
                                openInNewTab={option?.openInNewTab}
                            />
                        );
                    })}
            </MenuContextual>

            {toastMessage && toastVariant && (
                <div className="fixed bottom-4 right-10 z-50">
                    <Toast variant={toastVariant}>{toastMessage}</Toast>
                </div>
            )}
        </>
    );
};

export default CaseQuickActions;
