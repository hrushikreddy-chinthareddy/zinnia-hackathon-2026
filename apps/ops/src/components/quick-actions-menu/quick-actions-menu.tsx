import * as ReactTooltip from '@radix-ui/react-tooltip';
import { skipToken, useQuery } from '@tanstack/react-query';
import { TransactionPermission } from '@xd/utils/src/auth/auth';
import { Reason } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import { v4 as uuidV4 } from 'uuid';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import {
    commonPopoverClasses,
    commonTriggerClasses,
} from '@deps/components/popover/popover.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { deathClaimApplicableStatuses } from '@deps/containers/policy-summary-card/policy-summary-card.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { ProcessType } from '@deps/models/case/enums';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkFullSurrenderWithdrawal,
    checkInitialDeathClaimExistsQuery,
    checkLoanRepaymentOneTimeEligibilityQuery,
    checkNewLoanEligibilityQuery,
    checkOneTimePremiumEligibilityQuery,
    checkPartialWithdrawalOneTimeEligibilityQuery,
    checkSystematicProgramsEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as MenuHorizontal } from '@deps/styles/elements/icons/icons_outlined/menu-horizontal.svg';
import {
    DropdownClickedEvent,
    PolicyClickedEvent,
    SegmentTrackedEventName,
} from '@deps/types/segment-analytics';
import { isDemo } from '@deps/utils/environment.helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';

import styles from './quick-actions-menu.module.css';

interface TranslateProps {
    t: TFunction;
}

const TextButton = ({ t }: TranslateProps) => {
    return (
        <div className={clsx('md:flex', styles.quickActions)}>
            <p className="text-links">{t('label')}</p>
            <ChevronDown
                className="simple-transition group-data-[state=open]:rotate-180"
                height={16}
                width={16}
            />
        </div>
    );
};

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

export const MenuContextualContent = ({
    t,
    policy,
}: TranslateProps & QuickActionsMenuProps) => {
    const { sessionId, partyId: userPartyId } = usePermissionsContext();

    const { featureFlags } = useOptimizely();

    const freeLookEnabled =
        featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];
    const loanPaymentEnabled =
        featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];

    const isNewDeathClaimEnabled =
        policy.carrierId &&
        isFormFeatureEnabled(
            ProcessType.IDN_DEATH_CLAIM,
            policy.carrierId as string,
            featureFlags
        );

    const serviceRequestFormEnabled =
        featureFlags[FEATURE_FLAGS.SERVICE_REQUEST_FORM_ENABLED];
    const sendCorrespondenceEnabled =
        featureFlags[FEATURE_FLAGS.SEND_CORRESPONDENCE];

    const trackClick = (linkName: string, linkUrl: string) => {
        // TODO MG: do we always want to call both of these?
        segmentAnalyticsTrackEvent<DropdownClickedEvent>(
            SegmentTrackedEventName.DropdownClicked,
            {
                dropdownName: 'Policy Quick Actions',
                selectedItemName: linkName,
                session_id: sessionId,
                userId: userPartyId,
            }
        );
        segmentAnalyticsTrackEvent<PolicyClickedEvent>(
            SegmentTrackedEventName.PolicyClicked,
            {
                contractNumber: policy.policyNumber,
                linkName,
                linkUrl,
                session_id: sessionId,
                userId: userPartyId,
                planCode: policy.planCode,
            }
        );
    };

    const { isPermissioned: isUserPermissionedToDoTransaction } =
        useTransactionPermissionCheck(
            TransactionPermission.WriteAllTransactions,
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

    const transactionItems: JSX.Element[] = [];

    if (
        freeLookEnabled &&
        policy.freeLookPeriodDetails.isInFreeLookPeriod &&
        isUserPermissionedToDoTransaction
    ) {
        transactionItems.push(
            <MenuContextualItem
                key="free-look"
                content={t('transactions.freeLookCancel')}
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
                        href={`/contact-center/send-statement?planCode=${
                            policy.planCode
                        }&policyNumber=${
                            policy.policyNumber
                        }&correlationId=${uuidV4()}`}
                        onClick={() => {
                            trackClick(
                                'Send Statements',
                                `/contact-center/send-statement?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
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
                            href={`/contact-center/send-statement?planCode=${
                                policy.planCode
                            }&policyNumber=${
                                policy.policyNumber
                            }&correlationId=${uuidV4()}`}
                            onClick={() => {
                                trackClick(
                                    'Send Correspondence',
                                    `/contact-center/send-statement?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                                );
                            }}
                            openInNewTab={true}
                        />
                    )}
                </>
            </MenuContextualLabel>

            {serviceRequestFormEnabled && (
                <MenuContextualLabel label={t('additionalActions.label')}>
                    <MenuContextualItem
                        content={t('additionalActions.serviceRequestForm')}
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/default-case/`}
                        onClick={() => {
                            trackClick(
                                'Raise a Service Request',
                                `/policies/${policy.planCode}/${policy.policyNumber}/default-case/`
                            );
                        }}
                        openInNewTab={true}
                    />
                </MenuContextualLabel>
            )}
        </>
    );
};

export interface QuickActionsMenuProps {
    policy: PolicyDetails;
}

const QuickActionsMenu = ({ policy }: QuickActionsMenuProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'quickActions',
    });

    return (
        <>
            <div className="hidden md:block">
                <MenuContextual trigger={<TextButton t={t} />}>
                    <MenuContextualContent policy={policy} t={t} />
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
                            <MenuContextualContent policy={policy} t={t} />
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
        </>
    );
};

export default QuickActionsMenu;
