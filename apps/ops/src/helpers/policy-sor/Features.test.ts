import { PolicyFeatureFeatureType } from '@deps/models/policy/sor-policy';
import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import { Features } from './Features';

let features: Features;
describe('Features', () => {
    beforeAll(() => {
        features = new Features(mockPolicy?.policyFeatures);
    });

    describe('Features Class', () => {
        it('should getFeaturesByType', () => {
            expect(features.getFeaturesByType('FREELOOK' as PolicyFeatureFeatureType)).toHaveLength(1);
        });

        it('should getFirstFeatureByType', () => {
            expect(features.getFirstFeatureByType('FREELOOK' as PolicyFeatureFeatureType)).toBeTruthy();
        });

        it('should not blow up if no features are passed in', () => {
            const noFeatures = new Features(undefined);
            expect(noFeatures.getFeaturesByType('FREELOOK' as PolicyFeatureFeatureType)).toHaveLength(0);
            expect(noFeatures.getFirstFeatureByType('FREELOOK' as PolicyFeatureFeatureType)).toBeUndefined();
        });
    });
});
