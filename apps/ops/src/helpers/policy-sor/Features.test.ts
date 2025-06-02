import { FeatureType } from '@zinnia/api-types/types/sor';

import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import { Features } from './Features';

let features: Features;
describe('Features', () => {
    beforeAll(() => {
        features = new Features(mockPolicy?.policyFeatures);
    });

    describe('Features Class', () => {
        it('should getFeaturesByType', () => {
            expect(features.getFeaturesByType(FeatureType.FREELOOK)).toHaveLength(1);
        });

        it('should getFirstFeatureByType', () => {
            expect(features.getFirstFeatureByType(FeatureType.FREELOOK)).toBeTruthy();
        });

        it('should not blow up if no features are passed in', () => {
            const noFeatures = new Features(undefined);
            expect(noFeatures.getFeaturesByType(FeatureType.FREELOOK)).toHaveLength(0);
            expect(noFeatures.getFirstFeatureByType(FeatureType.FREELOOK)).toBeUndefined();
        });
    });
});
