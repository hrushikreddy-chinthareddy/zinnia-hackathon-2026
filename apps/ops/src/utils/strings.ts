export const DEFAULT_ERROR_STRING = '--';
export const DEFAULT_UNAVAILABLE_STRING =
    'This data is unavailable at this time. Please try again later.';
export const VALID_EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const toTitleCase = (value?: string | null): string => {
    if (!value) return '';

    return value.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
};

export const toSentenceCase = (value?: string | null): string => {
    if (!value) {
        return DEFAULT_ERROR_STRING;
    }

    return value?.charAt(0)?.toUpperCase() + value?.slice(1)?.toLowerCase();
};

export function uncapitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toLocaleLowerCase() + String(val).slice(1);
}

export function convertToCamelCase(val: string, splitter = '_') {
    let tempArray = val.split(splitter);
    tempArray = tempArray.map(
        (value) =>
            value.charAt(0).toUpperCase() +
            value.toLowerCase().slice(1, value.length)
    );
    return uncapitalizeFirstLetter(tempArray.join(''));
}

export function capitalize(str: string | undefined): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format SSN return 1234
export const formatSsn = (ssn?: string): string => {
    if (!ssn) {
        return DEFAULT_ERROR_STRING;
    }

    // Remove any non-numeric characters
    const cleanedSSN = ssn.replace(/\D/g, '');

    // Get the last 4 digits
    const last4Digits = cleanedSSN.slice(-4);

    // Append the last 4 digits to the static string
    return last4Digits;
};

export const formatCurrencyLocal = (value: number | string): string => {
    const numberValue = typeof value === 'string' ? Number(value) : value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(numberValue);
};

export const formatWithHash = (id: string) => {
    return `#${id}`;
};

/**
 *
 * Takes in the following combinations for phone numbers and formats them:
 * - 1234567890 -> 123-456-7890
 * - 123-456-7890 -> 123-456-7890
 * - 21234567890 -> 2-123-456-7890
 * - (123) 456-7890 -> 123-456-7890
 * - (123)456-7890 -> 123-456-7890
 * - +1 (123) 456-7890 -> 1-123-456-7890
 * - +1 (123)456-7890 -> 1-123-456-7890
 *
 */
export const formatPhoneNumber = (phoneNumber: string) => {
    // Regular expression to match and capture the parts of the phone number
    // The regex captures:
    // - Optional country code (\d{1,3})
    // - Optional area code (\d{3})
    // - First part of the rest of the phone number (\d{3})
    // - Second part of the rest of the phone number (\d{4})
    const match = phoneNumber.match(/^(\+?\d{1,3})?(\d{3})?(\d{3})(\d{4})$/);

    // If the phone number doesn't match the expected format, return the original phone number
    if (!match) {
        return phoneNumber; // Silently fail by returning the original input
    }

    // Extract the captured groups from the regex match
    const [, countryCode, areaCode, restOfPhonePrefix, restOfPhoneSuffix] =
        match;

    // Create an array with the captured parts, filtering out any undefined parts

    const formattedPhone = [
        countryCode,
        areaCode,
        restOfPhonePrefix,
        restOfPhoneSuffix,
    ]
        .filter(Boolean) // Remove undefined parts
        .join('-'); // Join the parts with dashes

    return formattedPhone;
};
