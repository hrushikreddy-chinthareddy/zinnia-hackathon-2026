import { TFunction } from 'next-i18next';

import {
    numberFormatify,
    percentFormatify,
} from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import { findFieldInNode } from '../data-node-helpers/traversal';
import { currencyFields } from '../translations/currency-fields';
import { dateFields } from '../translations/date-fields';
import { grammarCorrections } from '../translations/grammar-corrections';
import { industryTermToAbbrev } from '../translations/industry-term-to-abbrev';
import { percentageFields } from '../translations/percentage-fields';
import { DataField, DataNode, DataSection, FieldType } from '../types';

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
 * @param policyNomenclature The policy nomenclature
 * @returns "policy" if life policy, otherwise "contract"
 */
const replaceLineOfBusinessWords = (
    words: string,
    policyNomenclature: string
) => {
    return words.replace(/(\bpolicy\b)/gi, policyNomenclature);
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
 * Formats a data label as a human-readable string, taking into account
 * industry-specific abbreviations and grammar corrections.
 *
 * If an exact translation is available, it will be used. Otherwise, the
 * function will replace "policy" with "contract" if not a life policy,
 * apply industry term abbreviations and grammar corrections, and finally
 * capitalize the first letter of the sentence.
 *
 * @param label The data label to format
 * @param policyNomenclature The policy nomenclature
 * @param t The translation function
 * @returns The formatted data label
 */
export const formatAsDataLabel = ({
    label,
    policyNomenclature = 'policy',
    t,
}: {
    label: string;
    policyNomenclature?: string;
    t: TFunction;
}) => {
    const exactTranslation = t(`allFields.${label}`, {
        defaultValue: null, // Explicitly return null (not undefined) to infer the value from the key
        policyNomenclature: t(`policy.nomenclature.${policyNomenclature}`),
    });

    if (exactTranslation) {
        return exactTranslation;
    }

    const words = splitIntoWords(label);

    // Replace "policy" with "contract" if not a life policy
    const lineOfBusinessSpecificWords = replaceLineOfBusinessWords(
        words,
        policyNomenclature
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
 * @param fieldName The field name (optional)
 * @param fieldData The field data
 * @param t The translation function
 * @returns The formatted field data as a string
 */
export const formatAsDataValue = ({
    fieldName,
    fieldData,
    t,
}: {
    fieldData: string;
    t: TFunction;
    fieldName?: string;
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

    return value;
};

/**
 * Formats a DataField label and value
 *
 * @param fieldName The field name
 * @param fieldData The field data
 * @param t The translation function
 * @param policyNomenclature "policy" or "contract"
 * @returns The formatted data field
 */
export const formatDataField = ({
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
    return {
        value: formatAsDataValue({
            fieldData,
            fieldName,
            t,
        }),
        label: formatAsDataLabel({
            label: fieldName,
            policyNomenclature,
            t,
        }),
    };
};

/**
 * Adds a tooltip to a DataNode if it is a field
 *
 * @param node The node to add the tooltip to
 * @param t The translation function
 * @param policyNomenclature "policy" or "contract"
 * @returns The node with the tooltip added
 */
export const addToolTip = ({
    node,
    t,
    policyNomenclature,
}: {
    node: DataNode;
    t: TFunction;
    policyNomenclature?: string;
}) => {
    if (node.type === FieldType.field) {
        return {
            ...node,
            toolTip:
                t(`${policyNomenclature}.toolTips.${node.label}`, {
                    defaultValue: null,
                    policyNomenclature,
                }) ?? undefined,
        };
    }
    return node;
};

/**
 * Formats a DataNode's label and value (if it is a field)
 *
 * @param node The node to format
 * @param t The translation function
 * @param policyNomenclature "policy" or "contract"
 * @returns The formatted node
 */
export const formatNode = ({
    node,
    t,
    policyNomenclature,
}: {
    node: DataNode;
    t: TFunction;
    policyNomenclature?: string;
}): DataNode => {
    if (node.type !== FieldType.field) {
        if (node.type === FieldType.section) {
            return {
                ...node,
                label: formatAsDataLabel({
                    label: node.label,
                    policyNomenclature,
                    t,
                }),
            };
        }
        return node;
    }

    const formattedValue = formatDataField({
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

/**
 * Adds a link to the party's profile for a partyId DataField
 *
 * @param node The node to add the link to
 * @param planCode The plan code
 * @param policyNumber The policy number
 * @param allPartiesById The parties by ID
 * @returns The node with the link added
 */
export const addLinkToPartyId = ({
    node,
    planCode,
    policyNumber,
    allPartiesById,
}: {
    node: DataNode;
    planCode: string;
    policyNumber: string;
    allPartiesById: Record<string, DataSection | undefined>;
}) => {
    if (!(node.type === FieldType.field && node.label === 'partyId')) {
        return node;
    }
    const partyId = node.value;
    const partyReference = allPartiesById[partyId];

    const partyNameField = findFieldInNode({
        node: partyReference,
        key: 'partyName',
    }) ?? {
        type: FieldType.field,
        value: partyId,
        link: formatPartyLink({
            planCode,
            policyNumber,
            partyId,
        }),
        isPII: false,
    };

    const partialPartyField: DataField = {
        ...partyNameField,
        label: 'impactedParty',
    };

    return partialPartyField;
};

/**
 * Constructs a link to the party's profile
 *
 * @param partyId The party ID
 * @param planCode The plan code
 * @param policyNumber The policy number
 * @returns The link to the party's profile
 */
export const formatPartyLink = ({
    partyId,
    planCode,
    policyNumber,
}: {
    partyId: string;
    planCode: string;
    policyNumber: string;
}) => {
    return `/policies/${planCode}/${policyNumber}/people/${partyId}`;
};
