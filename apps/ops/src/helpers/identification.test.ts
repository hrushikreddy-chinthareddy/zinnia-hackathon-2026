import { cleanup } from '@testing-library/react';

import { Identification } from '@zinnia/api-types/types/sor';

import {
    getMainActiveIdentifications,
    getAdditionalActiveIdentifications,
    MAIN_IDENTIFICATION_TYPES,
} from './identification.helpers';

describe('helpers/identification', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    const createMockIdentification = (
        type: Identification.identificationType,
        endDate?: string
    ): Identification => ({
        identificationId: 'test-id',
        startDate: '2023-01-01',
        identificationType: type,
        identificationValue: 'test-value',
        endDate,
    });

    describe('getMainActiveIdentifications', () => {
        it('should return identifications with main types that are not end-dated', () => {
            // arrange
            const identifications = MAIN_IDENTIFICATION_TYPES.map((type) =>
                createMockIdentification(type)
            );

            // act
            const result = getMainActiveIdentifications(identifications);

            // assert
            expect(result).toHaveLength(4);
            expect(result.map((id) => id.identificationType)).toEqual([
                Identification.identificationType.SSN,
                Identification.identificationType.TIN,
                Identification.identificationType.EXTERNAL,
                Identification.identificationType.OTHER,
            ]);
        });

        it('should filter out end-dated identifications', () => {
            const identifications: Identification[] = [
                createMockIdentification(Identification.identificationType.SSN),
                createMockIdentification(
                    Identification.identificationType.TIN,
                    '2023-12-31'
                ),
                createMockIdentification(
                    Identification.identificationType.EXTERNAL
                ),
            ];

            const result = getMainActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                Identification.identificationType.SSN,
                Identification.identificationType.EXTERNAL,
            ]);
        });

        it('should handle undefined identifications array', () => {
            const result = getMainActiveIdentifications(undefined);

            expect(result).toEqual([]);
        });

        it('should handle empty identifications array', () => {
            const result = getMainActiveIdentifications([]);

            expect(result).toEqual([]);
        });

        it('should exclude identifications without identificationType', () => {
            const identifications: Identification[] = [
                createMockIdentification(Identification.identificationType.SSN),
                {
                    identificationId: 'test-id',
                    startDate: '2023-01-01',
                    identificationValue: 'test-value',
                } as Identification,
                createMockIdentification(Identification.identificationType.TIN),
            ];

            const result = getMainActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                Identification.identificationType.SSN,
                Identification.identificationType.TIN,
            ]);
        });
    });

    describe('getAdditionalActiveIdentifications', () => {
        it('should return non-main identifications that are not end-dated', () => {
            const identifications: Identification[] = [
                createMockIdentification(
                    Identification.identificationType.PASSPORT
                ),
                createMockIdentification(
                    Identification.identificationType.DRIVERLICENSENUMBER
                ),
                createMockIdentification(
                    Identification.identificationType.STATEPHOTOID
                ),
                createMockIdentification(Identification.identificationType.SSN),
                createMockIdentification(Identification.identificationType.TIN),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(3);
            expect(result.map((id) => id.identificationType)).toEqual([
                Identification.identificationType.PASSPORT,
                Identification.identificationType.DRIVERLICENSENUMBER,
                Identification.identificationType.STATEPHOTOID,
            ]);
        });

        it('should exclude end-dated identifications', () => {
            const identifications: Identification[] = [
                createMockIdentification(
                    Identification.identificationType.PASSPORT
                ),
                createMockIdentification(
                    Identification.identificationType.DRIVERLICENSENUMBER,
                    '2023-12-31'
                ),
                createMockIdentification(
                    Identification.identificationType.STATEPHOTOID
                ),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                Identification.identificationType.PASSPORT,
                Identification.identificationType.STATEPHOTOID,
            ]);
        });

        it('should handle undefined identifications array', () => {
            const result = getAdditionalActiveIdentifications(undefined);

            expect(result).toEqual([]);
        });

        it('should handle empty identifications array', () => {
            const result = getAdditionalActiveIdentifications([]);

            expect(result).toEqual([]);
        });

        it('should exclude identifications without identificationType', () => {
            const identifications: Identification[] = [
                createMockIdentification(
                    Identification.identificationType.PASSPORT
                ),
                {
                    identificationId: 'test-id',
                    startDate: '2023-01-01',
                    identificationValue: 'test-value',
                } as Identification,
                createMockIdentification(
                    Identification.identificationType.DRIVERLICENSENUMBER
                ),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                Identification.identificationType.PASSPORT,
                Identification.identificationType.DRIVERLICENSENUMBER,
            ]);
        });
    });
});
