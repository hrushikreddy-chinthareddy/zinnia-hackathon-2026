import {
    Identification,
    IdentificationType,
} from '@zinnia/api-types/types/sor';

import { isEndDated } from './date.helpers';

// The ID Types that are displayed in the main section of the card
export const MAIN_IDENTIFICATION_TYPES = [
    IdentificationType.SSN,
    IdentificationType.TIN,
    IdentificationType.EXTERNAL,
    IdentificationType.OTHER,
];

/**
 * filters identifications to get main active identifications.
 * main identifications are those with types in MAIN_IDENTIFICATION_TYPES.
 * active means they are not end-dated.
 * @param identifications
 * @returns non end-dated (active) main identifications
 */
export const getMainActiveIdentifications = (
    identifications?: Identification[]
): Identification[] => {
    return (
        identifications?.filter(
            (identification) =>
                identification?.identificationType &&
                MAIN_IDENTIFICATION_TYPES.includes(
                    identification?.identificationType
                ) &&
                !isEndDated(identification.endDate)
        ) ?? []
    );
};

/**
 * filters identifications to get additional active identifications.
 * additional identifications are those with types NOT in MAIN_IDENTIFICATION_TYPES.
 * active means they are not end-dated.
 * @param identifications
 * @returns non end-dated (active) additional identifications
 */
export const getAdditionalActiveIdentifications = (
    identifications?: Identification[]
): Identification[] => {
    return (
        identifications?.filter(
            (identification) =>
                identification?.identificationType &&
                !MAIN_IDENTIFICATION_TYPES.includes(
                    identification?.identificationType
                ) &&
                !isEndDated(identification.endDate)
        ) ?? []
    );
};
