import { PolicyStatus } from '@zinnia/api-types/types/sor';

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
            return 'status.pendingIssued';
        case PolicyStatus.ACTIVE:
            return 'status.active';
        case PolicyStatus.PENDINGLAPSE:
            return 'status.pendingLapse';
        case PolicyStatus.LAPSE:
            return 'status.lapse';
        case PolicyStatus.TERMINATED:
            return 'status.terminated';
        case PolicyStatus.MATURED:
            return 'status.matured';
        case PolicyStatus.PAYOUT:
            return 'status.payout';
        case PolicyStatus.SURRENDERED:
            return 'status.surrendered';
        case PolicyStatus.LIVINGCLAIMPENDING:
            return 'status.livingClaimPending';
        case PolicyStatus.DEATHCLAIMPENDING:
            return 'status.deathClaimPending';
        case PolicyStatus.DEATHCLAIMPAID:
            return 'status.deathClaimPaid';
        case PolicyStatus.CANCELEDFREELOOK:
            return 'status.canceledFreelook';
        case 'RECISSION' as PolicyStatus: // BPB - This policyStatus isn't in the most recent sor spec.  Update when available.
            return 'status.recission';
        default:
            return status;
    }
};

export const getBadgeStatusVariant = (
    status: PolicyStatus | undefined
): BadgeVariant => {
    if (status == null) return BadgeVariant.Neutral;

    switch (status) {
        case PolicyStatus.NOTISSUED:
            return BadgeVariant.Negative;
        case PolicyStatus.ACTIVE:
        case PolicyStatus.PENDINGISSUED:
        case PolicyStatus.MATURED:
        case PolicyStatus.PAYOUT:
            return BadgeVariant.Positive;
        case PolicyStatus.PENDINGLAPSE:
            return BadgeVariant.Warning;
        case PolicyStatus.LAPSE:
            return BadgeVariant.Negative;
        case PolicyStatus.TERMINATED:
        case PolicyStatus.SURRENDERED:
            return BadgeVariant.Urgent;
        case PolicyStatus.LIVINGCLAIMPENDING:
        case PolicyStatus.DEATHCLAIMPENDING:
        case 'RECISSION' as PolicyStatus: // BPB - This policyStatus isn't in the most recent sor spec.  Update when available.
        case PolicyStatus.CANCELEDFREELOOK:
            return BadgeVariant.Warning;
        case PolicyStatus.DEATHCLAIMPAID:
            return BadgeVariant.Neutral;
        default:
            return status as unknown as BadgeVariant;
    }
};
