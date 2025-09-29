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
    NestedData,
    DataField,
    NestedDataTuple,
    toolTip,
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
 * Given a label, a line of business, and a translation function, returns a formatted string for the section label.
 * If an exact translation is available, it will be used. Otherwise, the function will replace "policy" with "contract" if not a life policy,
 * apply industry term abbreviations and grammar corrections, and finally capitalize the first letter of the sentence.
 *
 * @param label The label to format
 * @param lineOfBusiness The line of business
 * @param t The translation function
 * @returns The formatted section label string
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
 * Formats a data label as a human-readable string, taking into account
 * industry-specific abbreviations and grammar corrections.
 *
 * If an exact translation is available, it will be used. Otherwise, the
 * function will replace "policy" with "contract" if not a life policy,
 * apply industry term abbreviations and grammar corrections, and finally
 * capitalize the first letter of the sentence.
 *
 * @param {string} label The data label to format
 * @param {LineOfBusiness} lineOfBusiness The line of business
 * @param {TFunction} t The translation function
 * @returns The formatted data label
 */
export const formatAsDataLabel = (
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
 * Formats a nested data tuple or a data field as a human-readable string
 *
 * Attempts to translate enums first, then processes as numeric data if no translation found
 * If the field name is provided, formats currency and date fields accordingly
 * If the field data is an object, returns the object as is
 * Otherwise, returns the field data as a string
 *
 * @param fieldData The nested data tuple or the data field to format
 * @param lineOfBusiness The line of business
 * @param t The translation function
 * @param fieldName The field name (optional)
 * @returns The formatted field data as a string
 */
export const formatAsDataValue = (
    fieldData: NestedData | DataField,
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
 * Formats a data field tuple as a human-readable string.
 *
 * @param tuple The data field tuple to format
 * @param lineOfBusiness The line of business
 * @param t The translation function to use
 * @param searchValue The search value to filter by
 * @param fieldLink The field link to filter by
 * @param fieldLinkedField The linked field to filter by
 * @returns The formatted data field tuple
 */
export const formatDataField = (
    tuple: NestedData | NestedDataTuple,
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    searchValue?: string,
    fieldLink?: string,
    fieldLinkedField?: string
): NestedData => {
    if (!isTuple(tuple)) {
        return null;
    }

    const [key, data] = tuple;
    const include =
        key != null &&
        typeof key === 'string' &&
        data != null &&
        !excludeFields.has(key);
    const formattedLabel = include && formatAsDataLabel(key, lineOfBusiness, t);

    const formattedData = formatAsDataValue(data, t, key);

    if (typeof formattedData === 'object' && formattedData != null) {
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

    const dataTuple: NestedData = [formattedLabel, formattedData];

    if (fieldLinkedField === key) {
        dataTuple[link] = fieldLink;
    }

    dataTuple[toolTip] =
        t(`policy.toolTips.${key}`, {
            defaultValue: null,
            policyNomenclature:
                lineOfBusiness === LineOfBusiness.LIFE
                    ? t('policy.nomenclature.policy')
                    : t('policy.nomenclature.contract'),
        }) ?? undefined;

    return dataTuple;
};

/**
 * Remove excluded and empty fields from a nested data tuple.
 *
 * @param tuples The nested data tuple to filter.
 * @param lineOfBusiness The line of business to filter by.
 * @param t The translation function to use.
 * @param fieldLink The field link to filter by.
 * @param linkedField The linked field to filter by.
 * @param searchValue The search value to filter by.
 * @param additionalFieldsToExclude Additional fields to exclude from the filtered result.
 * @returns The filtered nested data tuple.
 */
export const removeExcludedAndEmptyFields = (
    tuples: NestedData,
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    fieldLink?: string,
    linkedField?: string,
    searchValue?: string,
    additionalFieldsToExclude?: string[]
): NestedData => {
    const filteredTuples = tuples
        ?.map((tuple) => {
            // Ensure tuple is valid
            if (!isTuple(tuple)) {
                return null;
            }
            tuple;
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

export const isTuple = (tuple: any): tuple is NestedDataTuple =>
    tuple != null &&
    Array.isArray(tuple) &&
    tuple.length === 2 &&
    typeof tuple[0] === 'string';
