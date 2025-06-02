import { Policy, RiderType } from '@zinnia/api-types/types/sor';

import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import { Coverage } from './Coverage';

let coverage: Coverage;
describe('Coverage', () => {
    beforeAll(() => {
        coverage = new Coverage(mockPolicy);
    });

    describe('Coverage Class', () => {
        it('should getCoverageLayerByType', () => {
            expect(coverage.getCoverageLayerByType(RiderType.BASE)).toBeTruthy();
        });

        it('should getCoverageLayerById', () => {
            expect(coverage.getCoverageLayerById('Base_Coverage')).toBeTruthy();
        });

        it('should getCoverageParticipantByPartyId', () => {
            expect(coverage.getCoverageParticipantByPartyId('Party_PI_1')).toBeTruthy();
        });

        it('should not blow up if no policy is passed in', () => {
            const noCoverage = new Coverage(undefined as unknown as Policy);
            expect(noCoverage.getCoverageLayerById('Base_Coverage')).toBeUndefined();
            expect(noCoverage.getCoverageLayerByType(RiderType.BASE)).toBeUndefined();
            expect(noCoverage.allCoverageParticipants).toHaveLength(0);
            expect(noCoverage.getCoverageParticipantByPartyId('Party_PI_1')).toBeUndefined();
        });
    });
});
