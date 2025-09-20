import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { DEFAULT_ERROR_STRING } from '@xd/utils/src/strings';
import { TFunction } from 'next-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

import { currencyFields } from './translations/currency-fields';
import { dateFields } from './translations/date-fields';
import { excludeFields } from './translations/exclude-fields';
import { grammarCorrections } from './translations/grammar-corrections';
import { industryTermToAbbrev } from './translations/industry-term-to-abbrev';
import {
    label,
    tags,
    link,
    linkedField,
    NestedDataTuple,
    DataField,
} from './types';

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
    fieldData: NestedDataTuple | DataField,
    lineOfBusiness: LineOfBusiness,
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

    if (typeof fieldData === 'object') {
        return fieldData;
    }

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
    tuple: NestedDataTuple,
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    searchValue?: string,
    fieldLink?: string,
    fieldLinkedField?: string
): NestedDataTuple => {
    //TODO make into predicate
    if (
        tuple == null ||
        !Array.isArray(tuple) ||
        tuple.length < 2 ||
        typeof tuple[0] !== 'string'
    ) {
        return null;
    }

    const [key, data] = tuple;
    const include =
        key != null &&
        typeof key === 'string' &&
        data != null &&
        !excludeFields.has(key);
    const formattedLabel = include && formatAsDataLabel(key, lineOfBusiness, t);

    const formattedData = formatAsDataValue(data, lineOfBusiness, t, key);

    if (typeof formattedData === 'object' && formattedData != null) {
        //console.log('.....formattedData', key, formattedData);
        const fieldTags = formattedData[tags];
        const fieldLabel = formattedData[label];
        const fieldLink = formattedData[link];
        const fieldLinkedField = formattedData[linkedField];
        const formattedEntries = removeExcludedAndEmptyFields(
            Object.entries(formattedData),
            lineOfBusiness,
            t,
            fieldLink,
            fieldLinkedField,
            searchValue
        );

        if (formattedEntries == null) {
            return null;
        }
        //console.log('...formattedEntries', formattedEntries);

        //console.log('...formattedEntries', formattedEntries);
        formattedEntries[tags] = fieldTags;
        formattedEntries[label] = fieldLabel;
        formattedEntries[link] = fieldLink;
        formattedEntries[linkedField] = fieldLinkedField;

        return formattedEntries;
    }

    const displayIfSearched =
        include &&
        formattedLabel &&
        (!searchValue ||
            formattedLabel.toLowerCase().includes(searchValue.toLowerCase()) ||
            formattedData.toLowerCase().includes(searchValue.toLowerCase()));

    if (!displayIfSearched) {
        return null;
    }

    const dataTuple: NestedDataTuple = [formattedLabel, formattedData];

    if (fieldLinkedField === key) {
        dataTuple[link] = fieldLink;
    }
    return dataTuple;
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
    tuples: NestedDataTuple,
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    fieldLink?: string,
    linkedField?: string,
    searchValue?: string,
    additionalFieldsToExclude?: string[]
): NestedDataTuple => {
    const filteredTuples = tuples
        ?.map((tuple) => {
            // Ensure tuple is valid
            if (
                tuple == null ||
                !Array.isArray(tuple) ||
                tuple.length < 2 ||
                typeof tuple[0] !== 'string'
            ) {
                return null;
            }
            return !(
                additionalFieldsToExclude &&
                new Set(additionalFieldsToExclude).has(tuple[0])
            )
                ? formatDataField(
                      tuple,
                      lineOfBusiness,
                      t,
                      searchValue,
                      fieldLink,
                      linkedField
                  )
                : null;
        })
        .filter((tuple) => tuple !== null);
    return filteredTuples?.length ? filteredTuples : null;
};
