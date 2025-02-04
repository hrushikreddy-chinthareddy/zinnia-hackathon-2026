import { Icon, IconType } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import MenuContextual from '@deps/components/menu-contextual/menu-contextual';
import MenuContextualItem from '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item';
import MenuContextualLabel from '@deps/components/menu-contextual/menu-contextual-label/menu-contextual-label';
import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import QuickActionsMenu, { QuickActionsMenuProps } from '@deps/components/quick-actions-menu/quick-actions-menu';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Reason } from '@deps/models/policy/sor-policy';
import {
    checkEligibilityLoanRepaymentOneTime,
    checkEligibilityNewLoan,
    checkEligibilityOneTimePremium,
    checkEligibilityPartialWithdrawalOneTime,
    checkEligibilitySystematicPrograms,
    TransactionResponseStatus,
} from '@deps/queries/api/bpm';
import { PolicyClickedEvent, SegmentTrackedEventName } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

export interface QuickLinksProps extends QuickActionsMenuProps {
    links: {
        href: string;
        name: string;
        subLinks?: { href: string; name: string }[];
    }[];
    policy: PolicyDetails;
    sessionId: string;
    userPartyId: string;
}

const trackClick = (
    segmentTrackingName: string,
    linkName: string,
    linkUrl: string,
    policyNumber: string | undefined,
    sessionId: string | undefined,
    userPartyId: string | undefined
) => {
    if (!segmentTrackingName || !userPartyId || !sessionId) {
        return;
    }

    segmentAnalyticsTrackEvent<PolicyClickedEvent>(segmentTrackingName, {
        contractNumber: policyNumber,
        linkName,
        linkUrl,
        session_id: sessionId,
        userId: userPartyId,
    });
};

const QuickLinks = ({ links, planCode, policyNumber, policy, sessionId, userPartyId }: QuickLinksProps) => {
    const { featureFlags } = useOptimizely();

    // BPB - systematic programs work
    const systematicProgram = policy.policy.systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);
    const arrangementId = systematicProgram?.arrangementId || '';

    const [isEligibleManageAutopay, setIsEligibleManageAutopay] = useState(false);
    const [autopayChecked, setAutopayChecked] = useState(false);
    const [isEligibleNewPremium, setIsEligibleNewPremium] = useState(false);
    const [newPremiumChecked, setNewPremiumChecked] = useState(false);
    const [isEligibleWithdrawal, setIsEligibleWithdrawal] = useState(false);
    const [withdrawalChecked, setWithdrawalChecked] = useState(false);
    const [isEligibleNewLoan, setIsEligibleNewLoan] = useState(false);
    const [newLoanChecked, setNewLoanChecked] = useState(false);
    const [isEligibleLoanPayment, setIsEligibleLoanPayment] = useState(false);
    const [loanPaymentChecked, setLoanPaymentChecked] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [fireEligibilityChecks, setFireEligibilityChecks] = useState(false);

    const [isLife] = useState(policy.isLife);
    const [isAnnuity] = useState(policy.isAnnuity);
    const loanPaymentEnabled = featureFlags[FEATURE_FLAGS.LOAN_PAYMENT_TRANSACTION];

    // this should only run once after fireEligibilityChecks && isLife are both true
    useEffect(() => {
        if (fireEligibilityChecks && (isLife || isAnnuity)) {
            const checkManageAutopayEligibility = async () => {
                const manageAutopayEligibility = await checkEligibilitySystematicPrograms(planCode, policyNumber, arrangementId || '');

                if (manageAutopayEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleManageAutopay(true);
                }
                setAutopayChecked(true);
            };

            const checkOneTimeEligibility = async () => {
                const oneTimeEligibility = await checkEligibilityOneTimePremium(planCode, policyNumber);

                if (oneTimeEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleNewPremium(true);
                }
                setNewPremiumChecked(true);
            };

            const checkWithdrawalEligibility = async () => {
                const withdrawalEligibility = await checkEligibilityPartialWithdrawalOneTime(planCode, policyNumber);

                if (withdrawalEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleWithdrawal(true);
                }
                setWithdrawalChecked(true);
            };

            const checkNewLoanEligibility = async () => {
                const newLoanEligibility = await checkEligibilityNewLoan(planCode, policyNumber, policy.loanValues?.maximumLoanAmount);

                if (newLoanEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleNewLoan(true);
                }
                setNewLoanChecked(true);
            };

            const checkLoanPaymentEligibility = async () => {
                if (!loanPaymentEnabled) {
                    setIsEligibleLoanPayment(false);
                    setLoanPaymentChecked(true);

                    return;
                }
                const loanPaymentEligibility = await checkEligibilityLoanRepaymentOneTime(planCode, policyNumber);

                if (loanPaymentEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleLoanPayment(true);
                }
                setLoanPaymentChecked(true);
            };

            checkManageAutopayEligibility();
            checkOneTimeEligibility();
            checkWithdrawalEligibility();
            checkNewLoanEligibility();
            checkLoanPaymentEligibility();
        }
    }, [planCode, policyNumber, arrangementId, fireEligibilityChecks, isLife, isAnnuity, policy.loanValues?.maximumLoanAmount, loanPaymentEnabled]);

    useEffect(() => {
        if (autopayChecked && newPremiumChecked && withdrawalChecked && newLoanChecked && loanPaymentChecked) {
            setIsLoading(false);
        }
    }, [autopayChecked, loanPaymentChecked, newLoanChecked, newPremiumChecked, withdrawalChecked]);

    const eligibilityCheck = {
        eligibleAutopay: isEligibleManageAutopay,
        eligibleLoanPayment: isEligibleLoanPayment,
        eligibleNewLoan: isEligibleNewLoan,
        eligiblePremium: isEligibleNewPremium,
        eligibleWithdrawal: isEligibleWithdrawal,
        eligibleFreeLookCancel: policy.freeLookPeriodDetails.isInFreeLookPeriod,
    };

    function onOpenChange(open: boolean) {
        if (open) {
            setFireEligibilityChecks(true);
        }
    }

    return (
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-md" data-testid="quick-links">
            {links.map(({ name, href, subLinks }) => {
                if (subLinks) {
                    return (
                        <MenuContextual
                            key={name + href}
                            trigger={
                                <Typography variant={TypographyVariant.BodySmBold} className="text-secondary ">
                                    {name}
                                    <Icon type={IconType.CHEVRON} height={16} width={16} className="ml-1" />
                                </Typography>
                            }
                        >
                            <MenuContextualLabel label={name}>
                                {subLinks.map(subLink => {
                                    return <MenuContextualItem content={subLink.name} href={subLink.href} key={subLink.name} />;
                                })}
                            </MenuContextualLabel>
                        </MenuContextual>
                    );
                } else {
                    return (
                        <NavElement
                            className="font-primary text-md"
                            data-testid={name}
                            href={href}
                            key={name + href}
                            onClick={() =>
                                trackClick(SegmentTrackedEventName.PolicyClicked, name, href, policyNumber, sessionId, userPartyId)
                            }
                            type={NavElementType.Link}
                        >
                            {name}
                        </NavElement>
                    );
                }
            })}

            {(isLife || isAnnuity) && (
                <>
                    <div className="hidden min-w-[2px] bg-gray-100 md:block" />

                    <QuickActionsMenu
                        planCode={planCode}
                        policyNumber={policyNumber}
                        eligibilityCheck={eligibilityCheck}
                        isLoading={isLoading}
                        onOpenChange={onOpenChange}
                    />
                </>
            )}
        </div>
    );
};

export default QuickLinks;
