import { ValidationResult } from "@deps/queries/api/bpm";

export const formatValidationResult = (validationResult?: ValidationResult[]): string => {
    if (!validationResult || !validationResult.length) {
        return 'Unknown issue';
    }

    return validationResult.map((result) => `${result.error} ${result.resolution}`).join(' ');
};
