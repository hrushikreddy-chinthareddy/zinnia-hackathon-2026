import { mockPolicy } from '@deps/services/mocks/sor-policy';

import { getCarrierLogoSrc } from './policy-info';

jest.mock('@deps/queries/api/policies', () => ({
    fetchPolicy: jest.fn((id: string, planCode: string) => {
        if (id === 'AR49304815' && planCode === 'SBFIXUL1') {
            return Promise.resolve(mockPolicy);
        } 
    }),
}));

describe('getCarrierLogoSrc', () => {
    it('should contain the expected base url', () => {
        const carrierLogoSrc = getCarrierLogoSrc('Everly Life');

        expect(carrierLogoSrc).toContain(`${process.env.NEXT_PUBLIC_S3_BUCKET_BASE_URL}/images`);
    });

    it('should kebob case the marketing name', () => {
        const carrierLogoSrc = getCarrierLogoSrc('Everly Life');

        expect(carrierLogoSrc).toContain('everly-life');
    });

    it('should return the zinnia icon when marketing name is an empty string', () => {
        const carrierLogoSrc = getCarrierLogoSrc('');

        expect(carrierLogoSrc).toContain('zinnia-icon.svg');
    });
});