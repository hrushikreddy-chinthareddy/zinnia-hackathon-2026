import * as ReactTooltip from '@radix-ui/react-tooltip';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Heading,
    HeadingVariant,
    Toast,
    ToastVariant,
    Loader,
} from '@zinnia/bloom/components';
import { HttpStatusCode } from 'axios';
import clsx from 'clsx';
import { useTranslation, TFunction } from 'next-i18next';
import React, { useCallback, useState, useEffect } from 'react';
import { v4 as uuidV4 } from 'uuid';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import { Modal } from '@deps/components/modal/modal';
import { PopoverPlacement } from '@deps/components/popover/popover';
import {
    commonPopoverClasses,
    commonTriggerClasses,
} from '@deps/components/popover/popover.helpers';
import Tooltip from '@deps/components/tooltip/tooltip';
import { TranslationFiles } from '@deps/config/translations';
import CaseActionSideSheet from '@deps/containers/case-sub-page/caseActionsSideSheet';
import { deathClaimApplicableStatuses } from '@deps/containers/policy-summary-card/policy-summary-card.helpers';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import {
    useOptimizely,
    OptimizelyVariableKey,
} from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import {
    QUALITY_AUDIT_REVIEW_QUEUE_ADMIN,
    QUALITY_AUDIT_REVIEW_QUEUE_PROCESSOR,
} from '@deps/helpers/case-stat-helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useFreelookCancellation } from '@deps/hooks/useFreelookCancellation';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { Case, Statuses, QualityAuditStatus } from '@deps/models/case/case';
import { CaseAction, ProcessType } from '@deps/models/case/enums';
import { Carrier } from '@deps/models/case/withdrawal/case';
import {
    checkCaseQualityAuditEligibility,
    TransactionResponseStatus,
} from '@deps/queries/api/bpm';
import { createQualityAuditForCaseIdQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import {
    checkFullSurrenderWithdrawal,
    checkInitialDeathClaimExistsQuery,
    checkLoanRepaymentOneTimeEligibilityQuery,
    checkNewLoanEligibilityQuery,
    checkOneTimePremiumEligibilityQuery,
    checkPartialWithdrawalOneTimeEligibilityQuery,
    checkSystematicProgramsEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import {
    downloadAsIsIllustrationQuery,
    searchPoliciesQuery,
} from '@deps/queries/tanstack/policyQueries/policyQueries';
import { ReactComponent as MenuHorizontal } from '@deps/styles/elements/icons/icons_outlined/menu-horizontal.svg';
import { Source } from '@deps/types/search';
import {
    DropdownClickedEvent,
    PolicyClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { TransactionPermission } from '@deps/utils/auth';
import { isDemo } from '@deps/utils/environment.helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    isFormFeatureEnabled,
    isFeatureFlagVariableActive,
} from '@deps/utils/optimizely/utils';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
import { Reason } from '@zinnia/api-types/types/sor';

import { TextButton } from './quick-action-text-button';
import styles from './quick-actions-menu.module.css';
import { buildCreateQualityAuditPayload } from '../../containers/case-sub-page/case-helpers';
import { NavElementType } from '../nav-element/nav-element';
import SideSheetRequestCorrection from '../side-sheet/side-sheet-request-correction/side-sheet-request-correction';

interface TranslateProps {
    t: TFunction;
}

const IconButton = React.forwardRef<HTMLButtonElement, TranslateProps>(
    function iconButtonForwardRef(props, forwardRef) {
        const { t, ...restProps } = props;

        return (
            <ReactTooltip.Trigger
                asChild
                className={clsx(commonTriggerClasses, 'w-full')}
                ref={forwardRef}
            >
                <button
                    {...restProps}
                    aria-label={t('ariaLabel') as string}
                    className="!block"
                >
                    <MenuHorizontal
                        className="text-secondary"
                        height={24}
                        title={t('label') as string}
                        width={24}
                    />
                </button>
            </ReactTooltip.Trigger>
        );
    }
);

export const PolicyMenuContextualContent = ({
    t,
    policy,
    setIsLoadingModalOpen,
}: {
    t: TFunction;
    policy: PolicyDetails;
    setIsLoadingModalOpen: (isOpen: boolean) => void;
}) => {
    const limit = 1;
    const offset = 0;
    const { sessionId, partyId: userPartyId } = usePermissionsContext();

    const { featureFlags } = useOptimizely();

    const freeLookEnabled =
        featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];
    const loanPaymentEnabled =
        featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];
    const asIsIllustrationsEnabled =
        featureFlags[FEATURE_FLAGS.ILLUSTRATIONS_AS_IS_ILLUSTRATIONS];

    const isNewDeathClaimEnabled =
        policy.carrierId &&
        isFormFeatureEnabled(
            ProcessType.IDN_DEATH_CLAIM,
            policy.carrierId as string,
            featureFlags
        );

    const { data: policyReference } = useQuery({
        queryKey: [
            'policyReference',
            policy.policyNumber,
            policy.planCode,
            policy.carrierId,
            limit,
            offset,
        ],
        queryFn: () =>
            searchPoliciesQuery(
                policy.policyNumber as string,
                policy.planCode as string,
                [policy.carrierId as Carrier],
                limit,
                offset
            ),
        placeholderData: (previousData) => previousData,
    });

    const serviceRequestFormEnabled =
        policyReference?.[0]?.source === Source.ZAHARA;

    const sendCorrespondenceEnabled =
        featureFlags[FEATURE_FLAGS.SEND_CORRESPONDENCE];

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
                contractNumber: policy.policyNumber,
                linkName,
                linkUrl,
                authSessionId: sessionId,
                userId: userPartyId,
                planCode: policy.planCode,
            }
        );
    };

    const { isPermissioned: isUserPermissionedToDoTransaction } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policy.policyNumber,
            policy.planCode
        );
    const { isPermissioned: isUserPermissionedToSubmitDeathClaim } =
        useTransactionPermissionCheck(
            TransactionPermission.WriteNotificationOfDeathClaim,
            policy.policyNumber,
            policy.planCode
        );

    const premiumProgram = policy.systematicPrograms.getProgramsByReason(
        Reason.PREMIUM
    );

    const { data: systematicProgramsEligibility } = useQuery({
        queryKey: [
            'checkSystematicProgramsEligibility',
            policy.planCode,
            policy.policyNumber,
            premiumProgram?.arrangementId,
        ],
        queryFn: premiumProgram?.arrangementId
            ? () =>
                  checkSystematicProgramsEligibilityQuery(
                      policy.planCode as string,
                      policy.policyNumber as string,
                      premiumProgram?.arrangementId as string
                  )
            : skipToken,
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleManageAutopay:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: asIsIllustration } = useQuery({
        queryKey: ['asIsIllustration', policy.planCode, policy.policyNumber],
        queryFn: () =>
            downloadAsIsIllustrationQuery(
                policy.planCode as string,
                policy.policyNumber as string
            ),
        select: (data) => {
            return { ...data };
        },
    });

    const { data: oneTimePremiumEligibility } = useQuery({
        queryKey: [
            'checkOneTimePremiumEligibility',
            policy.planCode,
            policy.policyNumber,
        ],
        queryFn: () =>
            checkOneTimePremiumEligibilityQuery(
                policy.planCode as string,
                policy.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleOneTimePremium:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: partialWithdrawalOneTimeEligibility } = useQuery({
        queryKey: [
            'checkPartialWithdrawalOneTimeEligibility',
            policy.planCode,
            policy.policyNumber,
        ],
        queryFn: () =>
            checkPartialWithdrawalOneTimeEligibilityQuery(
                policy.planCode as string,
                policy.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligiblePartialWithdrawalOneTime:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: surrenderEligibility } = useQuery({
        queryKey: [
            'checkFullSurrenderWithdrawal',
            policy.planCode,
            policy.policyNumber,
        ],
        queryFn: () =>
            checkFullSurrenderWithdrawal(
                policy.planCode as string,
                policy.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleSurrender:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: newLoanEligibility } = useQuery({
        queryKey: [
            'checkNewLoanEligibility',
            policy.planCode,
            policy.policyNumber,
            policy.loanValues?.maximumLoanAmount,
        ],
        queryFn: () =>
            checkNewLoanEligibilityQuery(
                policy.planCode as string,
                policy.policyNumber as string,
                policy.loanValues?.maximumLoanAmount
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleNewLoan:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: loanRepaymentOneTimeEligibility } = useQuery({
        queryKey: [
            'checkLoanRepaymentOneTimeEligibility',
            policy.planCode,
            policy.policyNumber,
            policy.loanValues?.totalLoanBalance,
        ],
        queryFn: () =>
            checkLoanRepaymentOneTimeEligibilityQuery(
                policy.planCode as string,
                policy.policyNumber as string,
                policy.loanValues?.totalLoanBalance
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleLoanRepaymentOneTime:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: initialDeathClaimEligibility } = useQuery({
        queryKey: [
            'checkInitialDeathClaimExistsQuery',
            policy.policyNumber,
            policy.carrierId,
        ],
        queryFn: () =>
            checkInitialDeathClaimExistsQuery(
                policy.policyNumber as string,
                policy.carrierId as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleNewDeathClaim: data?.isNewRequest,
                zlCaseId: data?.zlCaseId || null,
            };
        },
        enabled: !isDemo(), //TODO: Remove this check when demo endpoint is available
    });

    const { data: BPMEligibility } = useQuery({
        queryKey: ['checkBPMAsIsIllustrationEligibility'],
        queryFn: () => {
            // This is a placeholder variable, should be replaced with a BPM call to check eligibility
            return true;
        },
    });

    const { data: freelookCancellation } = useFreelookCancellation(
        policy.product?.planCode,
        policy.policyNumber
    );

    const transactionItems: JSX.Element[] = [];

    if (
        freeLookEnabled &&
        freelookCancellation?.isEligibleFreelookCancellation &&
        policy.freeLookPeriodDetails.isInFreeLookPeriod &&
        isUserPermissionedToDoTransaction
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="free-look"
                content={t('transactions.freeLookCancel')}
                disabled={!freelookCancellation?.isEligibleFreelookCancellation}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/freelook/cancel-freelook/`}
                onClick={() => {
                    trackClick(
                        'Free Look Cancel',
                        `/policies/${policy.planCode}/${policy.policyNumber}/policy/freelook/cancel-freelook/`
                    );
                }}
            />
        );
    }

    if (
        isUserPermissionedToDoTransaction &&
        systematicProgramsEligibility?.isEligibleManageAutopay
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="manage-autopay"
                disabled={
                    !systematicProgramsEligibility?.isEligibleManageAutopay
                }
                content={t('transactions.managePremiumAutopay')}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/update-premium-autopay/`}
                onClick={() => {
                    trackClick(
                        'Manage Premium Autopay',
                        `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/update-premium-autopay/`
                    );
                }}
            />
        );
    }

    if (
        isUserPermissionedToDoTransaction &&
        oneTimePremiumEligibility?.isEligibleOneTimePremium
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="new-premium"
                disabled={!oneTimePremiumEligibility?.isEligibleOneTimePremium}
                content={t('transactions.newPremium')}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`}
                onClick={() => {
                    trackClick(
                        'New Premium',
                        `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`
                    );
                }}
            />
        );
    }

    if (
        isNewDeathClaimEnabled &&
        isUserPermissionedToSubmitDeathClaim &&
        initialDeathClaimEligibility?.isEligibleNewDeathClaim &&
        deathClaimApplicableStatuses.includes(policy.policyStatus)
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="new-death-claim"
                disabled={
                    (deathClaimApplicableStatuses.includes(
                        policy.policyStatus
                    ) &&
                        !initialDeathClaimEligibility?.isEligibleNewDeathClaim) ||
                    !deathClaimApplicableStatuses.includes(policy.policyStatus)
                }
                content={t('transactions.newDeathClaim')}
                href={`/claims/d-notification?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`}
                onClick={() => {
                    trackClick(
                        'New Death Claim',
                        `/claims/d-notification?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                    );
                }}
            />
        );
    }

    if (
        isUserPermissionedToDoTransaction &&
        partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="start-a-withdrawal"
                disabled={
                    !partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime
                }
                content={t('transactions.startAWithdrawal')}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/withdrawals/new-withdrawal/`}
                onClick={() => {
                    trackClick(
                        'Start a Withdrawal',
                        `/policies/${policy.planCode}/${policy.policyNumber}/policy/withdrawals/new-withdrawal/`
                    );
                }}
            />
        );
    }

    if (
        isUserPermissionedToDoTransaction &&
        surrenderEligibility?.isEligibleSurrender
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="surrender"
                disabled={!surrenderEligibility?.isEligibleSurrender}
                content={t('transactions.surrender')}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/withdrawals/new-withdrawal/`}
            />
        );
    }

    if (
        isUserPermissionedToDoTransaction &&
        newLoanEligibility?.isEligibleNewLoan
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="new-loan"
                disabled={!newLoanEligibility?.isEligibleNewLoan}
                content={t('transactions.newLoan')}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/new-loan/`}
                onClick={() => {
                    trackClick(
                        'New Loan',
                        `/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/new-loan/`
                    );
                }}
            />
        );
    }

    if (
        loanPaymentEnabled &&
        isUserPermissionedToDoTransaction &&
        loanRepaymentOneTimeEligibility?.isEligibleLoanRepaymentOneTime
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="loan-payment"
                disabled={
                    !loanRepaymentOneTimeEligibility?.isEligibleLoanRepaymentOneTime
                }
                content={t('transactions.loanPayment')}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/loan-payment/`}
                onClick={() => {
                    trackClick(
                        'Loan Payment',
                        `/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/loan-payment/`
                    );
                }}
            />
        );
    }

    const additionalItems: JSX.Element[] = [];

    if (serviceRequestFormEnabled) {
        additionalItems.push(
            <MenuContextualItem
                key="serviceRequestForm"
                content={t('additionalActions.serviceRequestForm')}
                href={`/policies/${policy.planCode}/${policy.policyNumber}/service-request/`}
                onClick={() => {
                    trackClick(
                        'Raise a Service Request',
                        `/policies/${policy.planCode}/${policy.policyNumber}/service-request/`
                    );
                }}
                openInNewTab={true}
            />
        );
    }

    if (BPMEligibility && asIsIllustrationsEnabled) {
        additionalItems.push(
            <MenuContextualItem
                key="createAsIsIllustration"
                content={t('additionalActions.createAsIsIllustration')}
                onClick={() =>
                    // downloadAsIsIllustrationQuery(
                    //     policy.policyNumber as string,
                    //     policy.planCode as string
                    // )
                    {
                        setIsLoadingModalOpen(true);
                        setTimeout(() => {
                            setIsLoadingModalOpen(false);
                        }, 5000);
                    }
                }
            />
        );
    }

    return (
        <>
            {transactionItems.length > 0 && (
                <MenuContextualLabel label={t('transactions.label')}>
                    <>{transactionItems}</>
                </MenuContextualLabel>
            )}
            <MenuContextualLabel label={t('documents.label')}>
                <>
                    <MenuContextualItem
                        content={t('documents.sendForms')}
                        href={`/contact-center/send-document?planCode=${
                            policy.planCode
                        }&policyNumber=${
                            policy.policyNumber
                        }&correlationId=${uuidV4()}`}
                        onClick={() => {
                            trackClick(
                                'Send Forms',
                                `/contact-center/send-document?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                            );
                        }}
                        openInNewTab={true}
                    />
                    <MenuContextualItem
                        content={t('documents.sendStatements')}
                        href={`/contact-center/send-correspondence?planCode=${
                            policy.planCode
                        }&policyNumber=${
                            policy.policyNumber
                        }&correlationId=${uuidV4()}`}
                        onClick={() => {
                            trackClick(
                                'Send Statements',
                                `/contact-center/send-correspondence?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                            );
                        }}
                        openInNewTab={true}
                    />
                    <MenuContextualItem
                        content={t('documents.sendTaxForms')}
                        href={`/contact-center/send-taxform?planCode=${
                            policy.planCode
                        }&policyNumber=${
                            policy.policyNumber
                        }&correlationId=${uuidV4()}`}
                        onClick={() => {
                            trackClick(
                                'Send Tax Forms',
                                `/contact-center/send-taxform?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                            );
                        }}
                        openInNewTab={true}
                    />
                    {sendCorrespondenceEnabled && (
                        <MenuContextualItem
                            content={t('documents.sendCorrespondence')}
                            href={`/contact-center/send-letter?planCode=${
                                policy.planCode
                            }&policyNumber=${
                                policy.policyNumber
                            }&correlationId=${uuidV4()}`}
                            onClick={() => {
                                trackClick(
                                    'Send Correspondence',
                                    `/contact-center/send-letter?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                                );
                            }}
                            openInNewTab={true}
                        />
                    )}
                </>
            </MenuContextualLabel>

            {additionalItems.length > 0 && (
                <MenuContextualLabel label={t('additionalActions.label')}>
                    <>{additionalItems}</>
                </MenuContextualLabel>
            )}
        </>
    );
};

export const CaseMenuContextualContent = ({
    t,
    caseDetails,
    escalated,
    setToastMessage,
    setToastVariant,
}: {
    t: TFunction;
    caseDetails: Case;
    escalated: boolean;
    setToastMessage: (message: string | null) => void;
    setToastVariant: (variant: ToastVariant | null) => void;
}) => {
    const { featureFlags } = useOptimizely();
    const {
        showRequestCorrection,
        hasPermissionToPrioritizeCases,
        isAllowOpsCaseReviewRequest,
        sessionId,
        partyId: userPartyId,
    } = usePermissionsContext();
    const sideSheet = useSideSheetContextLegacy();
    const { userTuplesData } = useCaseActivityContext();
    const { featureFlagVariables } = useOptimizely();
    const [isCaseEligibleForQualityAudit, setIsCaseEligibleForQualityAudit] =
        useState(false);

    const displayRequestCorrection =
        featureFlags[FEATURE_FLAGS.WRITE_REQUEST_CASE_CORRECTION];
    const isCasePrioritizationEnabled =
        featureFlags[FEATURE_FLAGS.CASE_PRIORITIZATION];

    const caseStatus = caseDetails?.caseStatus;
    const isInactiveStatus = [Statuses.Canceled, Statuses.Completed].includes(
        caseStatus
    );

    const canShowRequestCorrection =
        (displayRequestCorrection || showRequestCorrection) && isInactiveStatus;

    const canShowPriorityActions =
        isCasePrioritizationEnabled &&
        hasPermissionToPrioritizeCases &&
        !isInactiveStatus;

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
    }, [caseDetails]);

    const openRequestCorrectionSideSheet = () => {
        sideSheet.changeSideSheetContent(
            t('cases.requestCorrection'),
            <SideSheetRequestCorrection
                caseDetails={caseDetails}
                onClose={() => sideSheet.handleOpen(false)}
            />
        );
        sideSheet.handleOpen(true);
    };

    const openSideSheet = useCallback(
        (action: CaseAction) => {
            const content = (
                <CaseActionSideSheet
                    action={action}
                    caseId={caseDetails.id ?? ''}
                />
            );
            sideSheet.changeSideSheetContent(
                t(`cases.${action}.title`),
                content
            );
            sideSheet.handleOpen(true);
        },
        [caseDetails.id, sideSheet, t]
    );

    const handleDeprioritize = useCallback(
        () => openSideSheet(CaseAction.Deprioritize),
        [openSideSheet]
    );

    const handlePrioritize = useCallback(
        () => openSideSheet(CaseAction.Prioritize),
        [openSideSheet]
    );

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
                caseId: caseDetails.id,
            }
        );
    };
    const allowedQualityAuditRoles = [
        QUALITY_AUDIT_REVIEW_QUEUE_ADMIN,
        QUALITY_AUDIT_REVIEW_QUEUE_PROCESSOR,
    ];

    const carrier = caseDetails?.carrier?.toLowerCase();

    let hasCreateQualityAuditPermission =
        !!carrier &&
        Object.entries(userTuplesData as Record<string, unknown>).some(
            ([roleKey, carriers]) =>
                allowedQualityAuditRoles.includes(roleKey) &&
                Array.isArray(carriers) &&
                carriers.some(
                    (c): c is string =>
                        typeof c === 'string' && c.toLowerCase() === carrier
                )
        );

    hasCreateQualityAuditPermission =
        hasCreateQualityAuditPermission &&
        isFeatureFlagVariableActive(
            featureFlagVariables,
            FEATURE_FLAG_VARIABLES.CREATE_QUALITY_AUDIT,
            OptimizelyVariableKey.Clients,
            caseDetails?.carrier?.toLowerCase()
        );

    const isQualityAuditEligible =
        hasCreateQualityAuditPermission && isCaseEligibleForQualityAudit;

    const queryClient = useQueryClient();

    const qaCreatedQueryKey = ['qualityAuditCreated', caseDetails.id];

    const { data: isQualityAuditCreated = false } = useQuery<boolean>({
        queryKey: qaCreatedQueryKey,
        queryFn: () => false, // never actually fetches
        staleTime: Infinity,
        initialData: false,
    });

    const qualityAuditOption = React.useMemo(
        () => ({
            id: 'createQualityAudit',
            name: t('createQualityAudit'),
            isEligible: isQualityAuditEligible && !isQualityAuditCreated,
            shouldShow: hasCreateQualityAuditPermission,
            tooltip: !isCaseEligibleForQualityAudit
                ? t('caseIsNotEligible')
                : isQualityAuditCreated
                ? t('qualityAuditExisted')
                : isQualityAuditEligible
                ? t('createQualityAuditTooltip')
                : t('createQualityAuditTooltipDisabled'),
        }),
        [
            t,
            isQualityAuditEligible,
            hasCreateQualityAuditPermission,
            isCaseEligibleForQualityAudit,
            isQualityAuditCreated,
        ]
    );
    const handleCreateQualityAudit = async () => {
        try {
            const qualityAuditPayload =
                buildCreateQualityAuditPayload(caseDetails);
            const response = await createQualityAuditForCaseIdQuery(
                qualityAuditPayload
            );

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
                queryClient.setQueryData(qaCreatedQueryKey, true);
                setToastVariant(ToastVariant.Success);
                setToastMessage(t('qualityAuditSuccess'));
            }
        } catch (error) {
            console.error('quality audit error', error);
            setToastVariant(ToastVariant.Error);
            setToastMessage(t('qualityAuditError'));
        }
    };

    return (
        <>
            <MenuContextualLabel label="" hideLabel={true}>
                {hasCreateQualityAuditPermission && (
                    <Tooltip
                        key={qualityAuditOption.id}
                        placement={PopoverPlacement.TopLeft}
                        body={qualityAuditOption.tooltip}
                        isTabbable={false}
                        popoverClassName="md:mb-5"
                    >
                        <MenuContextualItem
                            key={qualityAuditOption.id}
                            content={qualityAuditOption.name}
                            disabled={!qualityAuditOption.isEligible}
                            onClick={handleCreateQualityAudit}
                            type={NavElementType.Button}
                        />
                    </Tooltip>
                )}
                {canShowRequestCorrection && (
                    <MenuContextualItem
                        content={t('cases.requestCorrection')}
                        onClick={openRequestCorrectionSideSheet}
                        openInNewTab={false}
                        type={NavElementType.Button}
                    />
                )}
                {canShowPriorityActions && (
                    <MenuContextualItem
                        content={
                            escalated
                                ? t('cases.deprioritize.title')
                                : t('cases.prioritize.title')
                        }
                        onClick={
                            escalated ? handleDeprioritize : handlePrioritize
                        }
                        type={NavElementType.Button}
                    />
                )}
                {isAllowOpsCaseReviewRequest && (
                    <MenuContextualItem
                        content={t('requestOperationReview.label')}
                        href={`/cases/${caseDetails.id}/operations-review`}
                        onClick={() => {
                            trackClick(
                                'Raise a Service Request',
                                `/cases/${caseDetails.id}/operations-review`
                            );
                        }}
                        type={NavElementType.Link}
                        openInNewTab={true}
                    />
                )}
            </MenuContextualLabel>
        </>
    );
};

export enum QuickActionsType {
    Policy = 'policy',
    Case = 'case',
}

type PolicyQuickActionsProps = {
    type: QuickActionsType.Policy;
    policy: PolicyDetails;
};

type CaseQuickActionsProps = {
    type: QuickActionsType.Case;
    caseDetails: Case;
    escalated: boolean;
};

export type QuickActionsMenuProps =
    | PolicyQuickActionsProps
    | CaseQuickActionsProps;

const QuickActionsMenu = (props: QuickActionsMenuProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'quickActions',
    });
    const { t: tAllFields } = useTranslation();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastVariant, setToastVariant] = useState<ToastVariant | null>(null);
    const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);

    useEffect(() => {
        if (!toastMessage) return;
        const id = setTimeout(() => {
            setToastMessage(null);
            setToastVariant(null);
        }, 4000);
        return () => clearTimeout(id);
    }, [toastMessage]);

    return (
        <>
            <div className="hidden md:block">
                <MenuContextual
                    trigger={
                        <TextButton
                            label={tAllFields('allFields.quickActions')}
                        />
                    }
                    triggerAsChild={true}
                >
                    {props.type === QuickActionsType.Policy ? (
                        <PolicyMenuContextualContent
                            policy={props.policy}
                            t={t}
                            setIsLoadingModalOpen={setIsLoadingModalOpen}
                        />
                    ) : (
                        <CaseMenuContextualContent
                            caseDetails={props.caseDetails}
                            t={t}
                            escalated={props.escalated}
                            setToastMessage={setToastMessage}
                            setToastVariant={setToastVariant}
                        />
                    )}
                </MenuContextual>
            </div>
            {/* small viewports */}
            <div className="md:hidden">
                <ReactTooltip.Provider>
                    <ReactTooltip.Root>
                        <MenuContextual
                            trigger={<IconButton t={t} />}
                            triggerAsChild={true}
                        >
                            {props.type === QuickActionsType.Policy ? (
                                <PolicyMenuContextualContent
                                    policy={props.policy}
                                    t={t}
                                    setIsLoadingModalOpen={
                                        setIsLoadingModalOpen
                                    }
                                />
                            ) : (
                                <CaseMenuContextualContent
                                    caseDetails={props.caseDetails}
                                    t={t}
                                    escalated={props.escalated}
                                    setToastMessage={setToastMessage}
                                    setToastVariant={setToastVariant}
                                />
                            )}
                        </MenuContextual>
                        <ReactTooltip.Portal>
                            <ReactTooltip.Content
                                align="end"
                                className="z-20 my-0.5"
                                side="top"
                            >
                                <div className={commonPopoverClasses}>
                                    <span className="body-sm">
                                        {t('label')}
                                    </span>
                                </div>
                            </ReactTooltip.Content>
                        </ReactTooltip.Portal>
                    </ReactTooltip.Root>
                </ReactTooltip.Provider>
            </div>

            {toastMessage && toastVariant && (
                <div className={styles.toastContainer}>
                    <Toast variant={toastVariant}>{toastMessage}</Toast>
                </div>
            )}

            {isLoadingModalOpen && (
                <Modal
                    open={isLoadingModalOpen}
                    closeIcon=""
                    onCancel={() => {}}
                    content={
                        <div className="flex flex-col items-center gap-4">
                            <Loader />
                            <Heading as={HeadingVariant.h3}>
                                {tAllFields(
                                    'quickActions.additionalActions.downloadingPdf'
                                )}
                            </Heading>
                        </div>
                    }
                />
            )}
        </>
    );
};

export default QuickActionsMenu;
