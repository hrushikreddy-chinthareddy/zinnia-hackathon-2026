import { useEffect, useState } from 'react';

import NavElement, { NavElementType } from '@deps/components/nav-element/nav-element';
import QuickActionsMenu, { QuickActionsMenuProps } from '@deps/components/quick-actions-menu/quick-actions-menu';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Reason } from '@deps/models/policy/sor-policy';
import {
    checkEligibilityOneTimePremium,
    checkEligibilityPartialWithdrawalOneTime,
    checkEligibilitySystematicPrograms,
    TransactionResponseStatus,
} from '@deps/queries/api/bpm';
import { SegmentTrackedEventName, SegmentTrackEventState } from '@deps/types/segment-analytics';

export interface QuickLinksProps extends QuickActionsMenuProps {
    links: {
        href: string;
        name: string;
        segmentTrackingName?: string;
        userPartyId?: string;
    }[];
    isLife: boolean;
    policy: PolicyDetails;
    userPartyId: string;
}

const trackClick = (
    segmentTrackingName: string,
    linkName: string,
    linkUrl: string,
    policyNumber: string | undefined,
    userPartyId: string | undefined
) => {
    if (!segmentTrackingName || !userPartyId) {
        return;
    }

    segmentAnalyticsTrackEvent(segmentTrackingName, {
        contractNumber: policyNumber,
        linkName,
        linkUrl,
        userId: userPartyId,
    });
};

const QuickLinks = ({ links, planCode, policyNumber, policy, userPartyId }: QuickLinksProps) => {
    // BPB - systematic programs work
    const systematicProgram = policy.policy.systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);
    const arrangementId = systematicProgram?.arrangementId || '';

    const [isEligibleManageAutopay, setIsEligibleManageAutopay] = useState(false);
    const [autopayChecked, setAutopayChecked] = useState(false);
    const [isEligibleNewPremium, setIsEligibleNewPremium] = useState(false);
    const [newPremiumChecked, setNewPremiumChecked] = useState(false);
    const [isEligibleWithdrawal, setIsEligibleWithdrawal] = useState(false);
    const [withdrawalChecked, setWithdrawalChecked] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [fireEligibilityChecks, setFireEligibilityChecks] = useState(false);

    const [isLife] = useState(policy.isLife);

    // this should only run once after fireEligibilityChecks && isLife are both true
    useEffect(() => {
        console.log('run onece');
        if (fireEligibilityChecks && isLife) {
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

            checkManageAutopayEligibility();
            checkOneTimeEligibility();
            checkWithdrawalEligibility();
        }
    }, [planCode, policyNumber, arrangementId, fireEligibilityChecks, isLife]);

    useEffect(() => {
        if (autopayChecked && newPremiumChecked && withdrawalChecked) {
            setIsLoading(false);
        }
    }, [autopayChecked, newPremiumChecked, withdrawalChecked]);

    const eligibilityCheck = {
        eligibleAutopay: isEligibleManageAutopay,
        eligiblePremium: isEligibleNewPremium,
        eligibleWithdrawal: isEligibleWithdrawal,
        eligibleFreeLookCancel: policy.isInActiveFreeLookPeriod,
    };

    function onOpenChange(open: boolean) {
        segmentAnalyticsTrackEvent(SegmentTrackedEventName.PolicyQuickActionsDropdown, {
            state: open ? SegmentTrackEventState.Open : SegmentTrackEventState.Close,
            policyNumber,
            userId: userPartyId,
        });

        if (open) {
            setFireEligibilityChecks(true);
        }
    }

    return (
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-md" data-testid="quick-links">
            {links.map(({ name, href, segmentTrackingName, userPartyId }) => (
                <NavElement
                    className="font-primary text-md"
                    data-testid={name}
                    href={href}
                    key={name + href}
                    onClick={segmentTrackingName ? () => trackClick(segmentTrackingName, name, href, policyNumber, userPartyId) : undefined}
                    type={NavElementType.Link}
                >
                    {name}
                </NavElement>
            ))}

            {isLife && (
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
