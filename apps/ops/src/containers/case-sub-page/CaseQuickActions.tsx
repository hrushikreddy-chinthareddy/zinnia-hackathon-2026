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
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { FNWL_QUALITY_AUDIT_REVIEW_QUEUE_ADMIN } from '@deps/helpers/case-stat-helpers';
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
    id: 'createQualityAudit' | 'prioritizeCase' | 'deprioritizeCase';
    name: string;
    hideLabel: boolean;
    isEligible: boolean;
    shouldShow: boolean;
    tooltip?: string | null;
    href?: string;
};

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
    const { caseDetails, userTuplesData } = useCaseActivityContext();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastVariant, setToastVariant] = useState<ToastVariant | null>(null);
    const [isQualityAuditCreated, setIsQualityAuditCreated] = useState(false);

    useEffect(() => {
        if (toastMessage && toastVariant) {
            const timer = setTimeout(() => {
                setToastMessage('');
                setToastVariant(null);
            }, INTERVAL);
            return () => clearTimeout(timer);
        }
    }, [toastMessage, toastVariant]);

    const hasQualityAuditAdminPermission = userTuplesData?.tuples?.some(
        (tuple: UserTuple) =>
            tuple?.key?.object.includes(FNWL_QUALITY_AUDIT_REVIEW_QUEUE_ADMIN)
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
                        return (
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
                                />
                            </Tooltip>
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
