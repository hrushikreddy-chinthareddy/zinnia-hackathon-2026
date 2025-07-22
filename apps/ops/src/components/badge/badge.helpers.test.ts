import { PolicyStatus } from '@zinnia/api-types/types/sor';

import {
    getBadgeStatus,
    getBadgeStatusVariant,
    BadgeVariant,
} from './badge.helpers';

describe('getBadgeStatus', () => {
    it('should return correct translation keys for known statuses', () => {
        expect(getBadgeStatus(PolicyStatus.NOTISSUED)).toBe('status.notIssued');
        expect(getBadgeStatus(PolicyStatus.PENDINGISSUED)).toBe(
            'status.pendingIssued'
        );
        expect(getBadgeStatus(PolicyStatus.ACTIVE)).toBe('status.active');
        expect(getBadgeStatus(PolicyStatus.PENDINGLAPSE)).toBe(
            'status.pendingLapse'
        );
        expect(getBadgeStatus(PolicyStatus.LAPSE)).toBe('status.lapse');
        expect(getBadgeStatus(PolicyStatus.TERMINATED)).toBe(
            'status.terminated'
        );
        expect(getBadgeStatus(PolicyStatus.MATURED)).toBe('status.matured');
        expect(getBadgeStatus(PolicyStatus.PAYOUT)).toBe('status.payout');
        expect(getBadgeStatus(PolicyStatus.SURRENDERED)).toBe(
            'status.surrendered'
        );
        expect(getBadgeStatus(PolicyStatus.LIVINGCLAIMPENDING)).toBe(
            'status.livingClaimPending'
        );
        expect(getBadgeStatus(PolicyStatus.DEATHCLAIMPENDING)).toBe(
            'status.deathClaimPending'
        );
        expect(getBadgeStatus(PolicyStatus.DEATHCLAIMPAID)).toBe(
            'status.deathClaimPaid'
        );
        expect(getBadgeStatus(PolicyStatus.CANCELEDFREELOOK)).toBe(
            'status.canceledFreeLook'
        );
    });

    it('should return correct keys for custom status strings', () => {
        expect(getBadgeStatus('RESCISSION' as PolicyStatus)).toBe(
            'status.rescission'
        );
        expect(getBadgeStatus('PND-AWAITFUNDS' as PolicyStatus)).toBe(
            'status.pndAwaitingFunds'
        );
        expect(getBadgeStatus('CANCELEDNOPREMIUM' as PolicyStatus)).toBe(
            'status.canceledNoPremium'
        );
    });

    it('should return empty string for undefined or null status', () => {
        expect(getBadgeStatus(undefined)).toBe('');
        expect(getBadgeStatus(null as any)).toBe('');
    });

    it('should return the original status if not matched', () => {
        expect(getBadgeStatus('UNKNOWN_STATUS' as PolicyStatus)).toBe(
            'UNKNOWN_STATUS'
        );
    });
});

describe('getBadgeStatusVariant', () => {
    it('should return correct badge variants for known statuses', () => {
        expect(getBadgeStatusVariant(PolicyStatus.NOTISSUED)).toBe(
            BadgeVariant.Negative
        );
        expect(getBadgeStatusVariant(PolicyStatus.ACTIVE)).toBe(
            BadgeVariant.Positive
        );
        expect(getBadgeStatusVariant(PolicyStatus.PENDINGISSUED)).toBe(
            BadgeVariant.Positive
        );
        expect(getBadgeStatusVariant(PolicyStatus.MATURED)).toBe(
            BadgeVariant.Positive
        );
        expect(getBadgeStatusVariant(PolicyStatus.PAYOUT)).toBe(
            BadgeVariant.Positive
        );
        expect(getBadgeStatusVariant(PolicyStatus.PENDINGLAPSE)).toBe(
            BadgeVariant.Warning
        );
        expect(getBadgeStatusVariant(PolicyStatus.LAPSE)).toBe(
            BadgeVariant.Negative
        );
        expect(getBadgeStatusVariant(PolicyStatus.TERMINATED)).toBe(
            BadgeVariant.Urgent
        );
        expect(getBadgeStatusVariant(PolicyStatus.SURRENDERED)).toBe(
            BadgeVariant.Urgent
        );
        expect(getBadgeStatusVariant(PolicyStatus.DEATHCLAIMPAID)).toBe(
            BadgeVariant.Neutral
        );
    });

    it('should return warning for special statuses', () => {
        expect(getBadgeStatusVariant(PolicyStatus.LIVINGCLAIMPENDING)).toBe(
            BadgeVariant.Warning
        );
        expect(getBadgeStatusVariant(PolicyStatus.DEATHCLAIMPENDING)).toBe(
            BadgeVariant.Warning
        );
        expect(getBadgeStatusVariant('RESCISSION' as PolicyStatus)).toBe(
            BadgeVariant.Warning
        );
        expect(getBadgeStatusVariant('PND-AWAITFUNDS' as PolicyStatus)).toBe(
            BadgeVariant.Warning
        );
        expect(getBadgeStatusVariant('CANCELEDNOPREMIUM' as PolicyStatus)).toBe(
            BadgeVariant.Warning
        );
        expect(getBadgeStatusVariant(PolicyStatus.CANCELEDFREELOOK)).toBe(
            BadgeVariant.Warning
        );
    });

    it('should return Neutral for null/undefined', () => {
        expect(getBadgeStatusVariant(undefined)).toBe(BadgeVariant.Neutral);
        expect(getBadgeStatusVariant(null as any)).toBe(BadgeVariant.Neutral);
    });

    it('should cast unknown status as unknown variant', () => {
        expect(getBadgeStatusVariant('UNKNOWN_VARIANT' as PolicyStatus)).toBe(
            'UNKNOWN_VARIANT'
        );
    });
});
