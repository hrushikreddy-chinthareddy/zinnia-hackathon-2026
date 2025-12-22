import { cleanup } from '@testing-library/react';

import {
    Identification,
    IdentificationType,
} from '@zinnia/api-types/types/sor';

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
        type: IdentificationType,
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
                IdentificationType.SSN,
                IdentificationType.TIN,
                IdentificationType.EXTERNAL,
                IdentificationType.OTHER,
            ]);
        });

        it('should filter out end-dated identifications', () => {
            const identifications: Identification[] = [
                createMockIdentification(IdentificationType.SSN),
                createMockIdentification(IdentificationType.TIN, '2023-12-31'),
                createMockIdentification(IdentificationType.EXTERNAL),
            ];

            const result = getMainActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationType.SSN,
                IdentificationType.EXTERNAL,
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
                createMockIdentification(IdentificationType.SSN),
                {
                    identificationId: 'test-id',
                    startDate: '2023-01-01',
                    identificationValue: 'test-value',
                } as Identification,
                createMockIdentification(IdentificationType.TIN),
            ];

            const result = getMainActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationType.SSN,
                IdentificationType.TIN,
            ]);
        });
    });

    describe('getAdditionalActiveIdentifications', () => {
        it('should return non-main identifications that are not end-dated', () => {
            const identifications: Identification[] = [
                createMockIdentification(IdentificationType.PASSPORT),
                createMockIdentification(
                    IdentificationType.DRIVERLICENSENUMBER
                ),
                createMockIdentification(IdentificationType.STATEPHOTOID),
                createMockIdentification(IdentificationType.SSN),
                createMockIdentification(IdentificationType.TIN),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(3);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationType.PASSPORT,
                IdentificationType.DRIVERLICENSENUMBER,
                IdentificationType.STATEPHOTOID,
            ]);
        });

        it('should exclude end-dated identifications', () => {
            const identifications: Identification[] = [
                createMockIdentification(IdentificationType.PASSPORT),
                createMockIdentification(
                    IdentificationType.DRIVERLICENSENUMBER,
                    '2023-12-31'
                ),
                createMockIdentification(IdentificationType.STATEPHOTOID),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationType.PASSPORT,
                IdentificationType.STATEPHOTOID,
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
                createMockIdentification(IdentificationType.PASSPORT),
                {
                    identificationId: 'test-id',
                    startDate: '2023-01-01',
                    identificationValue: 'test-value',
                } as Identification,
                createMockIdentification(
                    IdentificationType.DRIVERLICENSENUMBER
                ),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationType.PASSPORT,
                IdentificationType.DRIVERLICENSENUMBER,
            ]);
        });
    });
});
