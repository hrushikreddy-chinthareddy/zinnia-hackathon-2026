import { cleanup } from '@testing-library/react';

import {
    Identification,
    IdentificationTypeEnum,
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
        type: IdentificationTypeEnum,
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
                IdentificationTypeEnum.SSN,
                IdentificationTypeEnum.TIN,
                IdentificationTypeEnum.EXTERNAL,
                IdentificationTypeEnum.OTHER,
            ]);
        });

        it('should filter out end-dated identifications', () => {
            const identifications: Identification[] = [
                createMockIdentification(IdentificationTypeEnum.SSN),
                createMockIdentification(
                    IdentificationTypeEnum.TIN,
                    '2023-12-31'
                ),
                createMockIdentification(IdentificationTypeEnum.EXTERNAL),
            ];

            const result = getMainActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationTypeEnum.SSN,
                IdentificationTypeEnum.EXTERNAL,
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
                createMockIdentification(IdentificationTypeEnum.SSN),
                {
                    identificationId: 'test-id',
                    startDate: '2023-01-01',
                    identificationValue: 'test-value',
                } as Identification,
                createMockIdentification(IdentificationTypeEnum.TIN),
            ];

            const result = getMainActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationTypeEnum.SSN,
                IdentificationTypeEnum.TIN,
            ]);
        });
    });

    describe('getAdditionalActiveIdentifications', () => {
        it('should return non-main identifications that are not end-dated', () => {
            const identifications: Identification[] = [
                createMockIdentification(IdentificationTypeEnum.PASSPORT),
                createMockIdentification(
                    IdentificationTypeEnum.DRIVERLICENSENUMBER
                ),
                createMockIdentification(IdentificationTypeEnum.STATEPHOTOID),
                createMockIdentification(IdentificationTypeEnum.SSN),
                createMockIdentification(IdentificationTypeEnum.TIN),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(3);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationTypeEnum.PASSPORT,
                IdentificationTypeEnum.DRIVERLICENSENUMBER,
                IdentificationTypeEnum.STATEPHOTOID,
            ]);
        });

        it('should exclude end-dated identifications', () => {
            const identifications: Identification[] = [
                createMockIdentification(IdentificationTypeEnum.PASSPORT),
                createMockIdentification(
                    IdentificationTypeEnum.DRIVERLICENSENUMBER,
                    '2023-12-31'
                ),
                createMockIdentification(IdentificationTypeEnum.STATEPHOTOID),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationTypeEnum.PASSPORT,
                IdentificationTypeEnum.STATEPHOTOID,
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
                createMockIdentification(IdentificationTypeEnum.PASSPORT),
                {
                    identificationId: 'test-id',
                    startDate: '2023-01-01',
                    identificationValue: 'test-value',
                } as Identification,
                createMockIdentification(
                    IdentificationTypeEnum.DRIVERLICENSENUMBER
                ),
            ];

            const result = getAdditionalActiveIdentifications(identifications);

            expect(result).toHaveLength(2);
            expect(result.map((id) => id.identificationType)).toEqual([
                IdentificationTypeEnum.PASSPORT,
                IdentificationTypeEnum.DRIVERLICENSENUMBER,
            ]);
        });
    });
});
