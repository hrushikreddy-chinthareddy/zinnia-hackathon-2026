import { PolicyStatus } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export const getPolicyBadgeStatusTooltip = (status: PolicyStatus | undefined) => {
    if (status == null) return DEFAULT_ERROR_STRING;

    switch (status) {
        case PolicyStatus.NOTISSUED:
            return 'globalPolicyInfo.tooltip.status.notIssued';
        case PolicyStatus.PENDINGISSUED:
            return 'globalPolicyInfo.tooltip.status.pendingIssued';
        case PolicyStatus.ACTIVE:
            return 'globalPolicyInfo.tooltip.status.active';
        case PolicyStatus.PENDINGLAPSE:
            return 'globalPolicyInfo.tooltip.status.pendingLapse';
        case PolicyStatus.LAPSE:
            return 'globalPolicyInfo.tooltip.status.lapse';
        case PolicyStatus.TERMINATED:
            return 'globalPolicyInfo.tooltip.status.terminated';
        case PolicyStatus.MATURED:
            return 'globalPolicyInfo.tooltip.status.matured';
        case PolicyStatus.PAYOUT:
            return 'globalPolicyInfo.tooltip.status.payout';
        case PolicyStatus.SURRENDERED:
            return 'globalPolicyInfo.tooltip.status.surrendered';
        case PolicyStatus.LIVINGCLAIMPENDING:
            return 'globalPolicyInfo.tooltip.status.livingClaimPending';
        case PolicyStatus.DEATHCLAIMPENDING:
            return 'globalPolicyInfo.tooltip.status.deathClaimPending';
        case PolicyStatus.DEATHCLAIMPAID:
            return 'globalPolicyInfo.tooltip.status.deathClaimPaid';
        case PolicyStatus.RECISSION:
            return 'globalPolicyInfo.tooltip.status.recission';
        case PolicyStatus.CANCELEDFREELOOK:
            return 'globalPolicyInfo.tooltip.status.canceledFreelook';
        default:
            return status;
    }
};
