import { TFunction } from 'next-i18next';

import { FeatureType, PolicyFeature } from '@zinnia/api-types/types/sor';

import {
    filterValidFeature,
    getFeatureNameText,
    getFeatureStatusText,
} from './features-table-helpers';

const t = ((key: string) => key) as unknown as TFunction;

const baseFeature = {
    startDate: '2023-01-01',
    endDate: '2099-12-31',
    approvalDate: undefined,
    featureType: undefined,
    paymentAmount: undefined,
    period: undefined,
    timestamp: undefined,
    totalPaymentAmount: undefined,
} as unknown as PolicyFeature;

describe('getFeatureStatusText', () => {
    it('returns terminated text when endDate is before today', () => {
        const feature = {
            ...baseFeature,
            endDate: '2020-01-01',
        } as PolicyFeature;

        const result = getFeatureStatusText(feature, t);
        expect(result).toBe('Policy.extras.features.terminated');
    });

    it('returns active text when feature has an approvalDate', () => {
        const feature = {
            ...baseFeature,
            approvalDate: '2023-06-01',
        } as PolicyFeature;

        const result = getFeatureStatusText(feature, t);
        expect(result).toBe('Policy.extras.features.active');
    });

    it('returns available text when feature is not terminated and has no approvalDate', () => {
        const feature = {
            ...baseFeature,
        } as PolicyFeature;

        const result = getFeatureStatusText(feature, t);
        expect(result).toBe('Policy.extras.features.available');
    });

    it('prioritizes terminated over active when endDate is in the past', () => {
        const feature = {
            ...baseFeature,
            endDate: '2020-01-01',
            approvalDate: '2019-06-01',
        } as PolicyFeature;

        const result = getFeatureStatusText(feature, t);
        expect(result).toBe('Policy.extras.features.terminated');
    });
});

describe('getFeatureNameText', () => {
    it('returns translated lapse protection text for LAPSEPROTECTION type', () => {
        const feature = {
            ...baseFeature,
            featureType: FeatureType.LAPSEPROTECTION,
        } as PolicyFeature;

        const result = getFeatureNameText(feature, t);
        expect(result).toBe('policy.extras.features.lapseProtection');
    });

    it('returns featureType as-is for unknown types', () => {
        const feature = {
            ...baseFeature,
            featureType: 'SOMECUSTOMTYPE' as FeatureType,
        } as PolicyFeature;

        const result = getFeatureNameText(feature, t);
        expect(result).toBe('SOMECUSTOMTYPE');
    });

    it('returns empty string when featureType is undefined', () => {
        const feature = {
            ...baseFeature,
            featureType: undefined,
        } as PolicyFeature;

        const result = getFeatureNameText(feature, t);
        expect(result).toBe('');
    });
});

describe('filterValidFeature', () => {
    it('returns truthy for a feature with valid start and end dates', () => {
        const feature = {
            ...baseFeature,
            startDate: '2023-01-01',
            endDate: '2099-12-31',
        } as PolicyFeature;

        expect(filterValidFeature(feature)).toBeTruthy();
    });

    it('returns falsy when startDate is missing', () => {
        const feature = {
            ...baseFeature,
            startDate: undefined,
            endDate: '2099-12-31',
        } as PolicyFeature;

        expect(filterValidFeature(feature)).toBeFalsy();
    });

    it('returns falsy when endDate is missing', () => {
        const feature = {
            ...baseFeature,
            startDate: '2023-01-01',
            endDate: undefined,
        } as PolicyFeature;

        expect(filterValidFeature(feature)).toBeFalsy();
    });
});
