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
        default:
            return status;
    }
};
