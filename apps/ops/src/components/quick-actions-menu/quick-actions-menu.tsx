import * as ReactTooltip from '@radix-ui/react-tooltip';
import { skipToken, useQuery } from '@tanstack/react-query';
import { Reason } from '@zinnia/api-types/types/sor';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import { v4 as uuidV4 } from 'uuid';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import { commonPopoverClasses, commonTriggerClasses } from '@deps/components/popover/popover.helpers';
import { TranslationFiles } from '@deps/config/translations';
import {
    deathClaimApplicableStatuses
} from '@deps/containers/policy-summary-card/policy-summary-card.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
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
import { ReactComponent as PaymentIcon } from '@deps/styles/elements/icons/content/payment.svg';
import { ReactComponent as AutopayIcon } from '@deps/styles/elements/icons/currency/autopay.svg';
import { ReactComponent as BankIcon } from '@deps/styles/elements/icons/icons_outlined/bank.svg';
import { ReactComponent as BriefcaseIcon } from '@deps/styles/elements/icons/icons_outlined/briefcase.svg';
import { ReactComponent as CashIcon } from '@deps/styles/elements/icons/icons_outlined/cash.svg';
import { ReactComponent as ClipboardIcon } from '@deps/styles/elements/icons/icons_outlined/clipboard.svg';
import { ReactComponent as DocumentReportIcon } from '@deps/styles/elements/icons/icons_outlined/document-report.svg';
import { ReactComponent as MenuHorizontal } from '@deps/styles/elements/icons/icons_outlined/menu-horizontal.svg';
import { ReactComponent as TableIcon } from '@deps/styles/elements/icons/icons_outlined/table.svg';
import { ReactComponent as TicketIcon } from '@deps/styles/elements/icons/icons_outlined/ticket.svg';
import { DropdownClickedEvent, PolicyClickedEvent, SegmentTrackedEventName } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import styles from './quick-actions-menu.module.css';

interface TranslateProps {
    t: TFunction;
}

const TextButton = ({ t }: TranslateProps) => {
    return (
        <div className={clsx('md:flex', styles.quickActions)}>
            <p className="text-links">{t('label')}</p>
            <ChevronDown className="simple-transition group-data-[state=open]:rotate-180" height={16} width={16} />
        </div>
    );
};

const IconButton = React.forwardRef<HTMLButtonElement, TranslateProps>(function iconButtonForwardRef(props, forwardRef) {
    const { t, ...restProps } = props;

    return (
        <ReactTooltip.Trigger asChild className={clsx(commonTriggerClasses, 'w-full')} ref={forwardRef}>
            <button {...restProps} aria-label={t('ariaLabel') as string} className="!block">
                <MenuHorizontal className="text-secondary" height={24} title={t('label') as string} width={24} />
            </button>
        </ReactTooltip.Trigger>
    );
});

const MenuContextualContent = ({ t, policy }: TranslateProps & QuickActionsMenuProps) => {
    const { sessionId, partyId: userPartyId } = usePermissionsContext();

    const { featureFlags } = useOptimizely();

    const freeLookEnabled = featureFlags[FEATURE_FLAGS.POLICY_FREE_LOOK_CANCELLATION];
    const loanPaymentEnabled = featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];
    const isNewDeathClaim = featureFlags[FEATURE_FLAGS.NEW_DEATH_CLAIM];
    const serviceRequestFormEnabled = featureFlags[FEATURE_FLAGS.SERVICE_REQUEST_FORM_ENABLED];;

    const trackClick = (linkName: string, linkUrl: string) => {
        // TODO MG: do we always want to call both of these?
        segmentAnalyticsTrackEvent<DropdownClickedEvent>(SegmentTrackedEventName.DropdownClicked, {
            dropdownName: 'Policy Quick Actions',
            selectedItemName: linkName,
            session_id: sessionId,
            userId: userPartyId,
        });
        segmentAnalyticsTrackEvent<PolicyClickedEvent>(SegmentTrackedEventName.PolicyClicked, {
            contractNumber: policy.policyNumber,
            linkName,
            linkUrl,
            session_id: sessionId,
            userId: userPartyId,
        });
    };

    const premiumProgram = policy.systematicPrograms.getProgramsByReason(Reason.PREMIUM);

    const { data: systematicProgramsEligibility } = useQuery({
        queryKey: ['checkSystematicProgramsEligibility', policy.planCode, policy.policyNumber, premiumProgram?.arrangementId],
        queryFn: premiumProgram?.arrangementId
            ? () =>
                  checkSystematicProgramsEligibilityQuery(
                      policy.planCode as string,
                      policy.policyNumber as string,
                      premiumProgram?.arrangementId as string
                  )
            : skipToken,
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleManageAutopay: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: oneTimePremiumEligibility } = useQuery({
        queryKey: ['checkOneTimePremiumEligibility', policy.planCode, policy.policyNumber],
        queryFn: () => checkOneTimePremiumEligibilityQuery(policy.planCode as string, policy.policyNumber as string),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleOneTimePremium: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: partialWithdrawalOneTimeEligibility } = useQuery({
        queryKey: ['checkPartialWithdrawalOneTimeEligibility', policy.planCode, policy.policyNumber],
        queryFn: () => checkPartialWithdrawalOneTimeEligibilityQuery(policy.planCode as string, policy.policyNumber as string),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligiblePartialWithdrawalOneTime: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: surrenderEligibility } = useQuery({
        queryKey: ['checkFullSurrenderWithdrawal', policy.planCode, policy.policyNumber],
        queryFn: () => checkFullSurrenderWithdrawal(policy.planCode as string, policy.policyNumber as string),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleSurrender: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: newLoanEligibility } = useQuery({
        queryKey: ['checkNewLoanEligibility', policy.planCode, policy.policyNumber, policy.loanValues?.maximumLoanAmount],
        queryFn: () =>
            checkNewLoanEligibilityQuery(policy.planCode as string, policy.policyNumber as string, policy.loanValues?.maximumLoanAmount),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleNewLoan: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: loanRepaymentOneTimeEligibility } = useQuery({
        queryKey: ['checkLoanRepaymentOneTimeEligibility', policy.planCode, policy.policyNumber, policy.loanValues?.totalLoanBalance],
        queryFn: () =>
            checkLoanRepaymentOneTimeEligibilityQuery(
                policy.planCode as string,
                policy.policyNumber as string,
                policy.loanValues?.totalLoanBalance
            ),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleLoanRepaymentOneTime: data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: initialDeathClaimEligibility } = useQuery({
        queryKey: ['checkInitialDeathClaimExistsQuery', policy.policyNumber, policy.carrierId],
        queryFn: () => checkInitialDeathClaimExistsQuery(policy.policyNumber as string, policy.carrierId as string),
        placeholderData: previousData => previousData,
        select: data => {
            return {
                ...data,
                isEligibleNewDeathClaim: data?.isNewRequest,
                zlCaseId: data?.zlCaseId || null,
            };
        },
    });

    return (
        <>
            <MenuContextualLabel label={t('transactions.label')}>
                <>
                    {freeLookEnabled && policy.freeLookPeriodDetails.isInFreeLookPeriod && (
                        <MenuContextualItem
                            content={t('transactions.freeLookCancel')}
                            href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/freelook/cancel-freelook/`}
                            icon={<CashIcon height={20} width={20} />}
                            onClick={() => {
                                trackClick(
                                    'Free Look Cancel',
                                    `/policies/${policy.planCode}/${policy.policyNumber}/policy/freelook/cancel-freelook/`
                                );
                            }}
                        />
                    )}

                    <MenuContextualItem
                        disabled={!systematicProgramsEligibility?.isEligibleManageAutopay}
                        content={t('transactions.managePremiumAutopay')}
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/update-premium-autopay/`}
                        icon={<AutopayIcon height={20} width={20} />}
                        onClick={() => {
                            trackClick(
                                'Manage Premium Autopay',
                                `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/update-premium-autopay/`
                            );
                        }}
                    />

                    <MenuContextualItem
                        disabled={!oneTimePremiumEligibility?.isEligibleOneTimePremium}
                        content={t('transactions.newPremium')}
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`}
                        icon={<PaymentIcon height={20} width={20} />}
                        onClick={() => {
                            trackClick('New Premium', `/policies/${policy.planCode}/${policy.policyNumber}/policy/premiums/new-premium/`);
                        }}
                    />
                    {isNewDeathClaim && (
                        <MenuContextualItem
                           disabled={
                                (deathClaimApplicableStatuses.includes(policy.policyStatus) && !initialDeathClaimEligibility?.isEligibleNewDeathClaim)
                                    || (!deathClaimApplicableStatuses.includes(policy.policyStatus)
                                )
                             }
                            content={t('transactions.newDeathClaim')}
                            href={`/claims/d-notification?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`}
                            icon={<BriefcaseIcon height={20} width={20} />}
                            onClick={() => {
                                trackClick(
                                    'New Death Claim',
                                    `/claims/d-notification?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                                );
                            }}
                        />
                    )}
                    <MenuContextualItem
                        disabled={!partialWithdrawalOneTimeEligibility?.isEligiblePartialWithdrawalOneTime}
                        content={t('transactions.startAWithdrawal')}
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/withdrawals/new-withdrawal/`}
                        icon={<CashIcon height={20} width={20} />}
                        onClick={() => {
                            trackClick(
                                'Start a Withdrawal',
                                `/policies/${policy.planCode}/${policy.policyNumber}/policy/withdrawals/new-withdrawal/`
                            );
                        }}
                    />
                    <MenuContextualItem
                        disabled={!surrenderEligibility?.isEligibleSurrender}
                        content={t('transactions.surrender')}
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/withdrawals/new-withdrawal/`}
                        icon={<Icon type={IconType.CHECK} height={20} width={20} />}
                    />
                    <MenuContextualItem
                        disabled={!newLoanEligibility?.isEligibleNewLoan}
                        content={t('transactions.newLoan')}
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/new-loan/`}
                        icon={<BankIcon height={20} width={20} />}
                        onClick={() => {
                            trackClick('New Loan', `/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/new-loan/`);
                        }}
                    />
                    {loanPaymentEnabled && (
                        <MenuContextualItem
                            disabled={!loanRepaymentOneTimeEligibility?.isEligibleLoanRepaymentOneTime}
                            content={t('transactions.loanPayment')}
                            href={`/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/loan-payment/`}
                            icon={<PaymentIcon height={20} width={20} />}
                            onClick={() => {
                                trackClick(
                                    'Loan Payment',
                                    `/policies/${policy.planCode}/${policy.policyNumber}/policy/loans/loan-payment/`
                                );
                            }}
                        />
                    )}
                </>
            </MenuContextualLabel>
            <MenuContextualLabel label={t('documents.label')}>
                <MenuContextualItem
                    content={t('documents.sendForms')}
                    href={`/contact-center/send-document?planCode=${policy.planCode}&policyNumber=${
                        policy.policyNumber
                    }&correlationId=${uuidV4()}`}
                    icon={<ClipboardIcon height={20} width={20} />}
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
                    href={`/contact-center/send-correspondence?planCode=${policy.planCode}&policyNumber=${
                        policy.policyNumber
                    }&correlationId=${uuidV4()}`}
                    icon={<DocumentReportIcon height={20} width={20} />}
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
                    href={`/contact-center/send-taxform?planCode=${policy.planCode}&policyNumber=${
                        policy.policyNumber
                    }&correlationId=${uuidV4()}`}
                    icon={<TableIcon height={20} width={20} />}
                    onClick={() => {
                        trackClick(
                            'Send Tax Forms',
                            `/contact-center/send-taxform?planCode=${policy.planCode}&policyNumber=${policy.policyNumber}`
                        );
                    }}
                    openInNewTab={true}
                />
            </MenuContextualLabel>

            {serviceRequestFormEnabled && (
                <MenuContextualLabel label={t('additionalActions.label')}>
                    <MenuContextualItem
                        content={t('additionalActions.serviceRequestForm')}
                        href={`/policies/${policy.planCode}/${policy.policyNumber}/default-case/`}
                        icon={<TicketIcon height={20} width={20} />}
                        onClick={() => {
                            trackClick('Raise a Service Request', `/policies/${policy.planCode}/${policy.policyNumber}/default-case/`);
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
                        <MenuContextual trigger={<IconButton t={t} />} triggerAsChild={true}>
                            <MenuContextualContent policy={policy} t={t} />
                        </MenuContextual>
                        <ReactTooltip.Portal>
                            <ReactTooltip.Content align="end" className="z-20 my-0.5" side="top">
                                <div className={commonPopoverClasses}>
                                    <span className="body-sm">{t('label')}</span>
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
