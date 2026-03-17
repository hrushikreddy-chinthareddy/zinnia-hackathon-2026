import { Jsonify } from 'type-fest';

import { IllustrationsClientCase } from '@deps/types/illustrations';

export const parseClientCase = (
    clientCase: Jsonify<IllustrationsClientCase>
): IllustrationsClientCase => {
    const { insuredDetails: { dateOfBirth } = {} } = clientCase;

    // Parse the date while preserving the UTC date to avoid timezone shift issues.
    // When new Date() is called on a UTC datetime string like "2000-01-01T00:00:00.000+00:00",
    // the resulting Date object displays in local timezone, which can shift the date
    // (e.g., midnight UTC becomes Dec 31 at 7:00 PM in EST).
    // By extracting just the date portion and appending T12:00:00, we ensure the date
    // remains correct regardless of timezone (noon UTC won't shift to previous day in any timezone).
    let parsedDate: Date | undefined;
    if (dateOfBirth && typeof dateOfBirth === 'string') {
        // Validate the date string starts with YYYY-MM-DD pattern
        const dateMatch = dateOfBirth.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
            const dateOnly = dateMatch[1];
            const candidate = new Date(`${dateOnly}T12:00:00`);
            if (!isNaN(candidate.getTime())) {
                parsedDate = candidate;
            }
        }
    }

    // Use object spread instead of merge to ensure undefined overwrites the original value
    return {
        ...clientCase,
        insuredDetails: {
            ...clientCase.insuredDetails,
            dateOfBirth: parsedDate,
        },
    } as IllustrationsClientCase;
};
