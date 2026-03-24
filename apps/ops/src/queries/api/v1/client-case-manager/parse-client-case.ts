import { Jsonify } from 'type-fest';

import { IllustrationsClientCase } from '@deps/types/illustrations';
import { toNoonUtc } from '@deps/utils/dates';

export const parseClientCase = (
    clientCase: Jsonify<IllustrationsClientCase>
): IllustrationsClientCase => {
    const { insuredDetails: { dateOfBirth } = {} } = clientCase;

    // Parse the date to noon UTC to avoid timezone shift issues.
    const parsedDate =
        dateOfBirth && typeof dateOfBirth === 'string'
            ? toNoonUtc(dateOfBirth)
            : undefined;

    // Use object spread instead of merge to ensure undefined overwrites the original value
    return {
        ...clientCase,
        insuredDetails: {
            ...clientCase.insuredDetails,
            dateOfBirth: parsedDate,
        },
    } as IllustrationsClientCase;
};
