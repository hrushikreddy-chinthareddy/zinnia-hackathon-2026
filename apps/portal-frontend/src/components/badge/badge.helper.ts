import { PolicyStatus } from '@deps/models/policy/sor-policy';

export enum BadgeVariant {
    Default = 'default',
    Inactive = 'inactive',
    Info = 'info',
    Success = 'success',
    Positive = 'positive',
    Warning = 'warning',
    Error = 'error',
    Negative = 'negative',
    Urgent = 'urgent',
    Neutral = 'neutral',
    Brand = 'brand',
    Pending = 'pending',
}

// Pending Issued and Active are the same status
export const getBadgeStatus = (status: PolicyStatus | undefined) => {
    if (status == null) return '';

    switch (status) {
        case PolicyStatus.NOTISSUED:
            return 'status.notIssued';
        case PolicyStatus.PENDINGISSUED:
        case PolicyStatus.ACTIVE:
            return 'status.active';
        case PolicyStatus.PENDINGLAPSE:
            return 'status.pendingLapse';
        case PolicyStatus.LAPSE:
            return 'status.lapse';
        default:
            return status;
    }
};

export const getBadgeStatusVariant = (status: PolicyStatus | undefined): BadgeVariant => {
    if (status == null) return BadgeVariant.Neutral;

    switch (status) {
        case PolicyStatus.NOTISSUED:
            return BadgeVariant.Negative;
        case PolicyStatus.ACTIVE:
        case PolicyStatus.PENDINGISSUED:
            return BadgeVariant.Positive;
        case PolicyStatus.PENDINGLAPSE:
            return BadgeVariant.Warning;
        case PolicyStatus.LAPSE:
            return BadgeVariant.Negative;
        default:
            return status as BadgeVariant;
    }
};
