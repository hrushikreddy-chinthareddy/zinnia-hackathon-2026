import { useEffect, useState } from 'react';

import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import QuickActionsMenu, { QuickActionsMenuProps } from '@deps/components/quick-actions-menu/quick-actions-menu';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Reason } from '@deps/models/policy/sor-policy';
import {
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
    const newLoanEnabled = featureFlags?.[FEATURE_FLAGS.NEW_LOAN_TRANSACTION];

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

    const [isLoading, setIsLoading] = useState(true);
    const [fireEligibilityChecks, setFireEligibilityChecks] = useState(false);

    const [isLife] = useState(policy.isLife);
    const [isAnnuity] = useState(policy.isAnnuity);

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
                if (!newLoanEnabled) {
                    setNewLoanChecked(true);
                    return;
                }
                const newLoanEligibility = await checkEligibilityNewLoan(planCode, policyNumber, policy.loanValues?.maximumLoanAmount);

                if (newLoanEligibility?.status === TransactionResponseStatus.Success) {
                    setIsEligibleNewLoan(true);
                }
                setNewLoanChecked(true);
            };

            checkManageAutopayEligibility();
            checkOneTimeEligibility();
            checkWithdrawalEligibility();
            checkNewLoanEligibility();
        }
    }, [planCode, policyNumber, arrangementId, fireEligibilityChecks, isLife, isAnnuity, newLoanEnabled, policy.loanValues?.maximumLoanAmount]);

    useEffect(() => {
        if (autopayChecked && newPremiumChecked && withdrawalChecked && newLoanChecked) {
            setIsLoading(false);
        }
    }, [autopayChecked, newLoanChecked, newLoanEnabled, newPremiumChecked, withdrawalChecked]);

    const eligibilityCheck = {
        eligibleAutopay: isEligibleManageAutopay,
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
            {links.map(({ name, href }) => (
                <NavElement
                    className="font-primary text-md"
                    data-testid={name}
                    href={href}
                    key={name + href}
                    onClick={() => trackClick(SegmentTrackedEventName.PolicyClicked, name, href, policyNumber, sessionId, userPartyId)}
                    type={NavElementType.Link}
                >
                    {name}
                </NavElement>
            ))}

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
