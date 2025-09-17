import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { TFunction } from 'next-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

import { currencyFields } from './translations/currency-fields';
import { dateFields } from './translations/date-fields';
import { grammarCorrections } from './translations/grammar-corrections';
import { industryTermToAbbrev } from './translations/industry-term-to-abbrev';
import { DataKey, DataTuple, FieldData } from './types';
import { DEFAULT_ERROR_STRING } from '@xd/utils/src/strings';
import { excludeFields } from './translations/exclude-fields';

/**
 * Given a camel-cased string, returns the same string with each camel-case transition
 * separated by a space. For example, "camelCase" becomes "camel Case".
 *
 * @param label The string to split
 * @returns The same string, with each camel-case transition separated by a space.
 */
const splitIntoWords = (label: string) => {
    return label.replace(/([a-z])([A-Z])/g, '$1 $2');
};

/**
 * Given a string and a line of business, returns the same string with any
 * instances of "policy" replaced with "contract" for non-life policies.
 *
 * @param words The string to modify
 * @param lineOfBusiness The line of business
 * @returns "policy" if life policy, otherwise "contract"
 */
const replaceLineOfBusinessWords = (
    words: string,
    lineOfBusiness: LineOfBusiness
) => {
    if (lineOfBusiness !== LineOfBusiness.LIFE) {
        return words.replace(/(\bpolicy\b)/gi, 'contract');
    }
    return words;
};

/**
 * Given a string, returns the same string with all words capitalized unless
 * they are abbreviations. The first letter of the sentence is also capitalized.
 *
 * @param words The string of space-separated words to modify
 * @returns The same string, formatted as sentence case
 */
const formatAsSentenceCase = (words: string) => {
    return words
        .replace(
            /\w+/g,
            (word) => {
                return word === word.toUpperCase() ? word : word.toLowerCase();
            } // Convert words to lowercase, unless they are abbreviations
        )
        .replace(
            /^./g,
            (sentence) => sentence.toUpperCase() // Capitalize the first letter of the sentence
        );
};

/**
 * Formats a section label as a human-readable string
 *
 * @param label The section label to format
 * @param lineOfBusiness The line of business
 * @returns The formatted section label
 */
export const formatAsSectionLabel = (
    label: string,
    lineOfBusiness: LineOfBusiness,
    t: TFunction
) => {
    const exactTranslation = t(`policy.allFields.${label}`, {
        defaultValue: null, // Explicitly return null (not undefined) to infer the value from the key
        policyNomenclature:
            lineOfBusiness === LineOfBusiness.LIFE
                ? t('policy.nomenclature.policy')
                : t('policy.nomenclature.contract'),
    });

    if (exactTranslation !== null) {
        return exactTranslation;
    }

    const words = splitIntoWords(label);

    // Replace "policy" with "contract" if not a life policy
    const lineOfBusinessSpecificWords = replaceLineOfBusinessWords(
        words,
        lineOfBusiness
    );

    return formatAsSentenceCase(lineOfBusinessSpecificWords);
};

/**
 * Formats a data label as a human-readable string
 *
 * @param label The data label to format
 * @param lineOfBusiness The line of business
 * @returns The formatted data label
 */
const formatAsDataLabel = (
    label: string,
    lineOfBusiness: LineOfBusiness,
    t: TFunction
) => {
    const exactTranslation = t(`policy.allFields.${label}`, {
        defaultValue: null, // Explicitly return null (not undefined) to infer the value from the key
        policyNomenclature:
            lineOfBusiness === LineOfBusiness.LIFE
                ? t('policy.nomenclature.policy')
                : t('policy.nomenclature.contract'),
    });

    if (exactTranslation) {
        return exactTranslation;
    }

    const words = splitIntoWords(label);

    // Replace "policy" with "contract" if not a life policy
    const lineOfBusinessSpecificWords = replaceLineOfBusinessWords(
        words,
        lineOfBusiness
    );

    // Apply industry term abbreviations and grammar corrections
    const formatted = Object.entries({
        ...industryTermToAbbrev,
        ...grammarCorrections,
    }).reduce(
        (acc, [key, val]) =>
            acc.replace(
                new RegExp(`\\b${key}\\b`, 'i'), // whole word match, case insensitive
                val
            ),
        lineOfBusinessSpecificWords
    );
    return formatAsSentenceCase(formatted);
};

/**
 * Formats a field value as a human-readable string.
 * Depending on the field type, the value will be formatted as a string,
 * match from a map of known values, currency, date, or "--" for empty values.
 *
 * @param fieldData The field data to format
 * @param lineOfBusiness The line of business
 * @param fieldName The name of the field being formatted
 * @returns The formatted field value
 *
 */
export const formatAsDataValue = (
    fieldData: FieldData,
    t: TFunction,
    fieldName?: string
) => {
    // Empty values
    if (fieldData == null) return DEFAULT_ERROR_STRING;

    // Enums
    // Attempt to translate first, then process as numeric data if no translation found
    const exactTranslation = t(`policy.enums.${fieldData}`, {
        defaultValue: null,
    });
    if (exactTranslation !== null) return exactTranslation;

    // Currency
    if (fieldName && currencyFields.has(fieldName))
        return numberFormatify(String(fieldData));

    // Dates
    if (fieldName && dateFields.has(fieldName))
        return convertKebabedDateString(String(fieldData) || undefined);

    if (typeof fieldData === 'object' && fieldData !== null)
        return JSON.stringify(fieldData, null, 2); // FIXME: should never be object

    return String(fieldData);
};

/**
 * Given a tuple of a field name and its value, and a line of business, returns a tuple of a
 * human-readable field name and field value.
 *
 * The human-readable field name is formatted using {@link formatAsDataLabel}, and the
 * human-readable field value is formatted using {@link formatAsDataValue}.
 *
 * @param fieldData The tuple of a field name and its value
 * @param lineOfBusiness The line of business
 * @returns A tuple of a human-readable field name and field value
 *
 */
export const formatDataField = (
    tuple: DataTuple,
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    searchValue?: string
): [string, string] | null => {
    const [label, data] = tuple;
    const include =
        label != null &&
        typeof label === 'string' &&
        data != null &&
        !excludeFields.has(label);
    const formattedLabel =
        include && formatAsDataLabel(label, lineOfBusiness, t);
    const displayIfSearched =
        include &&
        formattedLabel &&
        (!searchValue ||
            formattedLabel.toLowerCase().includes(searchValue.toLowerCase()));

    return displayIfSearched
        ? [formattedLabel, formatAsDataValue(data, t, label)]
        : null;
};

/**
 * Given an array of key-value pairs, filters out any empty values and keys that
 * are excluded from display.
 *
 * @param tuples The array of key-value pairs to filter
 * @param additionalFieldsToExclude An optional array of additional fields to
 *      exclude from display
 * @returns The filtered array of key-value pairs
 */
export const removeExcludedAndEmptyFields = (
    tuples: DataTuple[],
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    searchValue?: string,
    additionalFieldsToExclude?: DataKey[]
) => {
    return tuples
        .map((tuple) => {
            const [key] = tuple;
            return !(
                additionalFieldsToExclude &&
                new Set(additionalFieldsToExclude).has(key)
            )
                ? formatDataField(tuple, lineOfBusiness, t, searchValue)
                : null;
        })
        .filter((tuple) => tuple != null);
};
