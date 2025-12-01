import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Toast, ToastVariant } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import { NavElementType } from '@deps/components/nav-element/nav-element';
import { PopoverPlacement } from '@deps/components/popover/popover';
import { TextButton } from '@deps/components/quick-actions-menu/quick-action-text-button';
import Tooltip from '@deps/components/tooltip/tooltip';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { FNWL_QUALITY_AUDIT_REVIEW_QUEUE_ADMIN } from '@deps/helpers/case-stat-helpers';
import { INTERVAL } from '@deps/models/case/task';
import { createQualityAuditForCaseId } from '@deps/queries/api/cases';
import { getCaseDetailsQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { UserTuple } from '@deps/types/fga';
import { CreateQualityAuditRequest } from '@deps/types/search';

import {
    buildCreateQualityAuditPayload,
    validateCaseQualityAudit,
} from './case-helpers';

type CaseQuickActionsProps = {
    isCaseEligibleForQualityAudit: boolean;
    escalated: boolean;
    canShowPriorityActions: boolean;
    handleCasePrioritize: () => void;
};

const CaseQuickActions: React.FC<CaseQuickActionsProps> = ({
    isCaseEligibleForQualityAudit,
    escalated,
    handleCasePrioritize,
    canShowPriorityActions,
}) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const { caseDetails, userTuplesData } = useCaseActivityContext();
    const queryClient = useQueryClient();
    const [toastMessage, setToastMessage] = useState<any>(undefined);
    const [toastVariant, setToastVariant] = useState<any>(undefined);
    const [isQualityAuditCreated, setIsQualityAuditCreated] = useState(false);
    const [refCaseId, setRefCaseId] = useState<string>('');

    useEffect(() => {
        if (toastMessage && toastVariant) {
            const timer = setTimeout(() => {
                setToastMessage(undefined);
                setToastVariant(undefined);
            }, INTERVAL);
            return () => clearTimeout(timer);
        }
    }, [toastMessage, toastVariant]);

    const hasQualityAuditAdminPermission = userTuplesData?.tuples?.some(
        (tuple: UserTuple) =>
            tuple?.key?.object.includes(FNWL_QUALITY_AUDIT_REVIEW_QUEUE_ADMIN)
    );

    const { data: parentCaseData } = useQuery({
        queryKey: ['existingQualityAuditCheck', caseDetails?.id, featureFlags],
        queryFn: () => getCaseDetailsQuery(caseDetails?.id, featureFlags),
        enabled: !!caseDetails?.id,
    });

    useEffect(() => {
        if (parentCaseData) {
            const hasExistingQualityAudit = validateCaseQualityAudit(
                caseDetails,
                parentCaseData
            );
            setIsQualityAuditCreated(hasExistingQualityAudit);
            hasExistingQualityAudit &&
                setRefCaseId(parentCaseData?.additionalData?.caseId || '');
        } else {
            if (caseDetails?.process === 'Quality Audit') {
                setIsQualityAuditCreated(true);
            }
        }
    }, [parentCaseData]);

    const qualityAuditPayload = buildCreateQualityAuditPayload(caseDetails);

    const { mutate, isPending } = useMutation({
        mutationFn: async (qualityAuditPayload: CreateQualityAuditRequest) => {
            return await createQualityAuditForCaseId(qualityAuditPayload);
        },
        onSuccess: (response) => {
            setToastVariant(ToastVariant.Success);
            setToastMessage(
                t('caseOverview.qualityAuditToastMessages.qualityAuditSuccess')
            );
            queryClient.invalidateQueries({
                queryKey: [
                    'existingQualityAuditCheck',
                    response?.data?.refCaseId || '',
                    featureFlags,
                ],
            });
        },
        onError: () => {
            setToastVariant(ToastVariant.Error);
            setToastMessage(
                t('caseOverview.qualityAuditToastMessages.qualityAuditError')
            );
        },
    });

    const isQualityAuditEligible =
        hasQualityAuditAdminPermission &&
        isCaseEligibleForQualityAudit &&
        !isPending &&
        !isQualityAuditCreated;

    const qualityAuditOptions = [
        {
            name: t('caseOverview.quickActions.createQualityAudit'),
            hideLabel: false,
            isEligible: isQualityAuditEligible,
            shouldShow:
                hasQualityAuditAdminPermission && !isQualityAuditCreated,
            tooltip: isQualityAuditEligible
                ? t('caseOverview.quickActions.createQualityAuditTooltip')
                : t(
                      'caseOverview.quickActions.createQualityAuditTooltipDisabled'
                  ),
            href: '',
        },
        {
            name: t('caseOverview.quickActions.viewQualityAudit'),
            hideLabel: false,
            isEligible: isQualityAuditCreated,
            shouldShow: isQualityAuditCreated,
            tooltip: t('caseOverview.quickActions.viewQualityAuditTooltip', {
                caseId: caseDetails?.id,
            }),
            href: `/cases/${refCaseId}/progress`,
        },
        {
            name: t('caseOverview.prioritizeCase.title'),
            hideLabel: false,
            isEligible: true,
            shouldShow: canShowPriorityActions && !escalated,
        },
        {
            name: t('caseOverview.deprioritizeCase.title'),
            hideLabel: false,
            isEligible: true,
            shouldShow: canShowPriorityActions && escalated,
        },
    ];

    const handleQuickActionsMethods = (option: any) => {
        if (
            option?.name === t('caseOverview.quickActions.createQualityAudit')
        ) {
            mutate(qualityAuditPayload);
        } else if (
            option?.name === t('caseOverview.prioritizeCase.title') ||
            option?.name === t('caseOverview.deprioritizeCase.title')
        ) {
            handleCasePrioritize();
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
                <MenuContextualLabel label={'quick actions'} hideLabel={true}>
                    {qualityAuditOptions
                        .filter((option) => option.shouldShow)
                        .map((option) => {
                            return (
                                <Tooltip
                                    key={option.name}
                                    placement={PopoverPlacement.TopLeft}
                                    body={option.tooltip}
                                    isTabbable={false}
                                    popoverClassName="md:mb-5"
                                >
                                    <MenuContextualItem
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
                                    />
                                </Tooltip>
                            );
                        })}
                </MenuContextualLabel>
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
