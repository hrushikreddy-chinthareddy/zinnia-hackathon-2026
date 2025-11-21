import { cleanup } from '@testing-library/react';

import { FeatureType, PolicyStatus } from '@zinnia/api-types/types/sor';

jest.mock('@deps/components/badge/badge.helpers', () => ({
    getBadgeStatus: (s: any) => `status.${s}`,
    getBadgeStatusVariant: (s: any) => `variant.${s}`,
}));

jest.mock(
    '@deps/components/global-values/global-values-bar/global-values-helpers',
    () => ({
        getPolicyBadgeStatusTooltip: (s: any) => `tooltip.${s}`,
    })
);

jest.mock('@deps/helpers/numbers.helpers', () => ({
    numberFormatify: (n: any) => `FMT:${n}`,
}));

jest.mock('@deps/helpers/string.helpers', () => ({
    formatDate: (d: any) => (d ? 'DATE:' + d : ''),
}));

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    getTotalMinRequiredAmount,
    policyDataToGlobalValues,
} from './global-values';

describe('helpers/global-values', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    describe('getTotalMinRequiredAmount', () => {
        it('returns totalMinimumRequiredAmount when feature is present', () => {
            const policy: any = {
                features: {
                    getFirstFeatureByType: (type: any) =>
                        type === FeatureType.LAPSEASSESSMENT
                            ? { totalMinimumRequiredAmount: 1234 }
                            : undefined,
                },
            };
            expect(getTotalMinRequiredAmount(policy)).toBe(1234);
        });

        it('returns default error string when feature is missing', () => {
            const policy: any = {
                features: { getFirstFeatureByType: () => undefined },
            };
            expect(getTotalMinRequiredAmount(policy)).toBe(
                DEFAULT_ERROR_STRING
            );
        });
    });

    describe('policyDataToGlobalValues', () => {
        const t = (k: string, opts?: any) =>
            opts
                ? `${k}${opts.tooltipDate ? ' ' + opts.tooltipDate : ''}$${
                      opts.tooltipAmount ? ' ' + opts.tooltipAmount : ''
                  }`
                : k;

        const basePolicy = {
            carrierId: 'C1',
            marketingName: 'MKT',
            productType: 'PROD',
            planName: 'PLAN',
            generalLedgerPlanCode: 'GL',
            planCode: 'PC',
            policyNumber: 'POL123',
            issueDate: 'ISSUE',
        } as any;

        it('maps fields and builds tooltip for non-lapse status using issueDate', () => {
            const policy: any = {
                ...basePolicy,
                policyStatus: PolicyStatus.ACTIVE,
                features: { getFirstFeatureByType: () => undefined },
            };

            const out = policyDataToGlobalValues(policy, t as any);
            expect(out.policyNumber).toBe('POL123');
            expect(out.status).toBe(`status.${PolicyStatus.ACTIVE}`);
            expect(out.variant).toBe(`variant.${PolicyStatus.ACTIVE}`);
            expect(out.tooltip).toContain(`tooltip.${PolicyStatus.ACTIVE}`);
            expect(out.tooltip).toContain('FMT:' + DEFAULT_ERROR_STRING);
            expect(out.tooltip).toContain('DATE:ISSUE');
        });

        it('uses pending lapse endDate for tooltip date and formatted amount', () => {
            const policy: any = {
                ...basePolicy,
                policyStatus: PolicyStatus.LAPSE,
                features: {
                    getFirstFeatureByType: (type: any) =>
                        type === FeatureType.LAPSEASSESSMENT
                            ? {
                                  endDate: 'END',
                                  totalMinimumRequiredAmount: 555,
                              }
                            : undefined,
                },
            };

            const out = policyDataToGlobalValues(policy, t as any);
            expect(out.tooltip).toContain(`tooltip.${PolicyStatus.LAPSE}`);
            expect(out.tooltip).toContain('DATE:END');
            expect(out.tooltip).toContain('FMT:555');
        });

        it('handles PENDINGLAPSE similarly to LAPSE', () => {
            const policy: any = {
                ...basePolicy,
                policyStatus: PolicyStatus.PENDINGLAPSE,
                features: {
                    getFirstFeatureByType: () => ({
                        endDate: 'E2',
                        totalMinimumRequiredAmount: 1,
                    }),
                },
            };
            const out = policyDataToGlobalValues(policy, t as any);
            expect(out.tooltip).toContain(
                `tooltip.${PolicyStatus.PENDINGLAPSE}`
            );
            expect(out.tooltip).toContain('DATE:E2');
        });
    });
});
