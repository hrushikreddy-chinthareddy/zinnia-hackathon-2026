import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { PolicyStatus } from '@zinnia/api-types/types/sor';

import { getPolicyBadgeStatusTooltip } from './global-values-helpers';

describe('getPolicyBadgeStatusTooltip', () => {
    it('should return correct tooltip key for each defined PolicyStatus', () => {
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.NOTISSUED)).toBe(
            'globalPolicyInfo.tooltip.status.notIssued'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.PENDINGISSUED)).toBe(
            'globalPolicyInfo.tooltip.status.pendingIssued'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.ACTIVE)).toBe(
            'globalPolicyInfo.tooltip.status.active'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.PENDINGLAPSE)).toBe(
            'globalPolicyInfo.tooltip.status.pendingLapse'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.LAPSE)).toBe(
            'globalPolicyInfo.tooltip.status.lapse'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.TERMINATED)).toBe(
            'globalPolicyInfo.tooltip.status.terminated'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.MATURED)).toBe(
            'globalPolicyInfo.tooltip.status.matured'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.PAYOUT)).toBe(
            'globalPolicyInfo.tooltip.status.payout'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.SURRENDERED)).toBe(
            'globalPolicyInfo.tooltip.status.surrendered'
        );
        expect(
            getPolicyBadgeStatusTooltip(PolicyStatus.LIVINGCLAIMPENDING)
        ).toBe('globalPolicyInfo.tooltip.status.livingClaimPending');
        expect(
            getPolicyBadgeStatusTooltip(PolicyStatus.DEATHCLAIMPENDING)
        ).toBe('globalPolicyInfo.tooltip.status.deathClaimPending');
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.DEATHCLAIMPAID)).toBe(
            'globalPolicyInfo.tooltip.status.deathClaimPaid'
        );
        expect(getPolicyBadgeStatusTooltip(PolicyStatus.CANCELEDFREELOOK)).toBe(
            'globalPolicyInfo.tooltip.status.canceledFreeLook'
        );
    });

    it('should return correct tooltip key for string values', () => {
        expect(getPolicyBadgeStatusTooltip('RESCISSION' as PolicyStatus)).toBe(
            'globalPolicyInfo.tooltip.status.rescission'
        );
        expect(
            getPolicyBadgeStatusTooltip('PND-AWAITFUNDS' as PolicyStatus)
        ).toBe('globalPolicyInfo.tooltip.status.pndAwaitingFunds');
        expect(
            getPolicyBadgeStatusTooltip('CANCELEDNOPREMIUM' as PolicyStatus)
        ).toBe('globalPolicyInfo.tooltip.status.canceledNoPremium');
    });

    it('should return DEFAULT_ERROR_STRING for undefined or null status', () => {
        expect(getPolicyBadgeStatusTooltip(undefined)).toBe(
            DEFAULT_ERROR_STRING
        );
        expect(
            getPolicyBadgeStatusTooltip(null as unknown as PolicyStatus)
        ).toBe(DEFAULT_ERROR_STRING);
    });

    it('should return status itself if it does not match any case', () => {
        expect(
            getPolicyBadgeStatusTooltip('UNKNOWN_STATUS' as PolicyStatus)
        ).toBe('UNKNOWN_STATUS');
    });
});
