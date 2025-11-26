import { TFunction } from 'next-i18next';

import {
    numberFormatify,
    percentFormatify,
} from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { currencyFields } from './translations/currency-fields';
import { dateFields } from './translations/date-fields';
import { grammarCorrections } from './translations/grammar-corrections';
import { industryTermToAbbrev } from './translations/industry-term-to-abbrev';
import { percentageFields } from './translations/percentage-fields';
import { NestedDataTuple, DataNode, FieldType } from './types';

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
export const formatAsSectionLabel = ({
    label,
    lineOfBusiness,
    t,
}: {
    label: string;
    lineOfBusiness: LineOfBusiness;
    t: TFunction;
}) => {
    const exactTranslation = t(`allFields.${label}`, {
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
export const formatAsDataLabel = ({
    label,
    lineOfBusiness,
    t,
}: {
    label: string;
    lineOfBusiness: LineOfBusiness;
    t: TFunction;
}) => {
    const exactTranslation = t(`allFields.${label}`, {
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
export const formatAsDataValue = ({
    fieldName,
    fieldData,
    t,
    policyNomenclature,
}: {
    fieldData: string;
    t: TFunction;
    fieldName: string;
    policyNomenclature?: string;
}) => {
    let value = fieldData;
    // Empty values
    if (fieldData == null) value = DEFAULT_ERROR_STRING;

    // Enums
    // Attempt to translate first, then process as numeric data if no translation found
    const exactTranslation = t(`enums.${fieldData}`, {
        defaultValue: null,
    });
    if (exactTranslation !== null) value = exactTranslation;

    // Currency
    if (fieldName && currencyFields.has(fieldName))
        value = numberFormatify(Number(fieldData));

    // Percentages
    if (fieldName && percentageFields.has(fieldName))
        value = percentFormatify(Number(fieldData), { isInteger: true });

    // Dates
    if (fieldName && dateFields.has(fieldName))
        value = convertKebabedDateString(String(fieldData) || undefined);

    return {
        value: String(value),
        label: t(`allFields.${fieldName}`, { policyNomenclature }),
    };
};

export const excludeNodes = (
    node: DataNode,
    exclude: string[]
): DataNode | null => {
    if ('label' in node && exclude.includes(node.label)) {
        return null;
    }
    return node;
};

export const formatSectionLabel = ({
    t,
    nomenclature,
}: {
    t: TFunction;
    nomenclature?: string;
}) => {
    return (node: DataNode): DataNode => {
        if (node.type === FieldType.section) {
            return {
                ...node,
                label:
                    t(`allFields.${node.label}`, {
                        defaultValue: null,
                        policyNomenclature: nomenclature,
                    }) ?? node.label,
            };
        }
        return node;
    };
};

export const formatNode = (
    node: DataNode,
    t: TFunction,
    policyNomenclature?: string
): DataNode => {
    if (node.type !== FieldType.field) {
        return node;
    }

    const formattedValue = formatAsDataValue({
        fieldData: node.value,
        fieldName: node.label,
        t,
        policyNomenclature,
    });

    return {
        ...node,
        value: formattedValue.value,
        label: formattedValue.label,
    };
};

// Removes excluded sections or nodes and formats labels / values
export const combinedTransform = ({
    t,
    exclude,
    policyNomenclature,
}: {
    t: TFunction;
    exclude: string[];
    policyNomenclature?: string;
}) => {
    return (node: DataNode): DataNode | null => {
        const afterExclude = excludeNodes(node, exclude);
        if (afterExclude === null) return null;

        return formatNode(afterExclude, t, policyNomenclature);
    };
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
 * @param type The
 * @returns The formatted data field tuple
 */
// export const formatDataField = ({
//     tuple,
//     lineOfBusiness,
//     t,
//     type,
//     searchValue,
//     fieldLink,
//     fieldLinkedField,
// }: {
//     tuple: NestedData | NestedDataTuple;
//     lineOfBusiness: LineOfBusiness;
//     t: TFunction;
//     type: FormatterType;
//     searchValue?: string;
//     fieldLink?: string;
//     fieldLinkedField?: string;
// }): NestedData => {
//     if (!isTuple(tuple)) {
//         return null;
//     }

//     const [key, data] = tuple;
//     const include =
//         key != null &&
//         typeof key === 'string' &&
//         data != null &&
//         !excludeFields.has(key);

//     if (!include) {
//         return null;
//     }

//     const formattedLabel = formatAsDataLabel({ label: key, lineOfBusiness, t });
//     const formattedData = formatAsDataValue({
//         fieldData: data,
//         t,
//         fieldName: key,
//     });

//     if (typeof formattedData === 'object' && formattedData != null) {
//         const fieldTags = formattedData[tags];
//         const fieldLabel = formattedData[label] ?? formattedLabel;
//         const fieldLink = formattedData[link];
//         const fieldLinkedField = formattedData[linkedField];
//         const formattedEntries = removeExcludedAndEmptyFields({
//             tuples:
//                 formattedData instanceof Array
//                     ? (formattedData.map((v, i) => [
//                           `${key} ${i + 1}`,
//                           v,
//                       ]) as NestedData)
//                     : (Object.entries<NestedData>(formattedData) as NestedData),
//             lineOfBusiness,
//             t,
//             type,
//             fieldLink,
//             linkedField: fieldLinkedField,
//             searchValue,
//         });

//         if (formattedEntries == null) {
//             return null;
//         }

//         formattedEntries[tags] = fieldTags;
//         formattedEntries[label] = fieldLabel;
//         formattedEntries[link] = fieldLink;
//         formattedEntries[linkedField] = fieldLinkedField;

//         return formattedEntries;
//     }

//     const displayIfSearched =
//         include &&
//         formattedLabel &&
//         (!searchValue ||
//             formattedLabel.toLowerCase().includes(searchValue.toLowerCase()) ||
//             formattedData.toLowerCase().includes(searchValue.toLowerCase()));

//     if (!displayIfSearched) {
//         return null;
//     }

//     const dataTuple: NestedData = [formattedLabel, formattedData];

//     if (fieldLinkedField === key) {
//         dataTuple[link] = fieldLink;
//     }

//     dataTuple[toolTip] =
//         t(`${type}.toolTips.${key}`, {
//             defaultValue: null,
//             policyNomenclature:
//                 lineOfBusiness === LineOfBusiness.LIFE
//                     ? t('policy.nomenclature.policy')
//                     : t('policy.nomenclature.contract'),
//         }) ?? undefined;

//     return dataTuple;
// };

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
// export const removeExcludedAndEmptyFields = ({
//     tuples,
//     lineOfBusiness,
//     t,
//     type,
//     fieldLink,
//     linkedField,
//     searchValue,
//     additionalFieldsToExclude,
// }: {
//     tuples: NestedData;
//     lineOfBusiness: LineOfBusiness;
//     t: TFunction;
//     type: FormatterType;
//     fieldLink?: string;
//     linkedField?: string;
//     searchValue?: string;
//     additionalFieldsToExclude?: string[];
// }): NestedData => {
//     const filteredTuples = tuples
//         ?.map((tuple) => {
//             // Ensure tuple is valid
//             if (!isTuple(tuple)) {
//                 return null;
//             }

//             return !(
//                 additionalFieldsToExclude &&
//                 new Set(additionalFieldsToExclude).has(tuple[0])
//             )
//                 ? formatDataField({
//                       tuple,
//                       lineOfBusiness,
//                       t,
//                       type,
//                       searchValue,
//                       fieldLink,
//                       fieldLinkedField: linkedField,
//                   })
//                 : null;
//         })
//         .filter((tuple) => tuple !== null);
//     return filteredTuples?.length ? filteredTuples : null;
// };

export const isTuple = (tuple: any): tuple is NestedDataTuple =>
    tuple != null &&
    Array.isArray(tuple) &&
    tuple.length === 2 &&
    (typeof tuple[0] === 'string' || typeof tuple[0] === 'number');
