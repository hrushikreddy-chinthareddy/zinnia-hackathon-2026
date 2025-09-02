import { Policy, LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { TFunction } from 'i18next';

import {
    AnnuityDetailsViewInfo,
    AnnuityViewDetailsDto,
} from '@deps/data/annuity-details-view';
import {
    generatePolicyAnnuityDetailsDto,
    isTermLifeProduct,
} from '@deps/data/details-view';
import {
    PolicyDetailsViewInfo,
    PolicyViewDetailsDto,
    TermLifeDetailsViewInfo,
} from '@deps/data/policy-details-view';
import { fillColDefs } from '@deps/helpers/data-transform.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { DataDefinition } from '@deps/types/data';

import { currencyFields } from './translations/currency-fields';
import { dateFields } from './translations/date-fields';
import { enums } from './translations/enums';
import { exactTranslations } from './translations/exact';
import { excludeFields } from './translations/exclude-fields';
import { grammarCorrections } from './translations/grammar-corrections';
import { industryTermToAbbrev } from './translations/industry-term-to-abbrev';
import { sectionTypeToSubsectionTitleFields } from './translations/subsection-field-to-title';
import {
    DataTuple,
    FieldData,
    PolicySection,
    PreparedPolicy,
    PreparedPolicySection,
} from './types';

/**
 * Takes in a policy and generates the key values search fields for that policy
 */
export const prepareSearchableData = (policy: Policy, t: TFunction) => {
    const dto = generatePolicyAnnuityDetailsDto(policy);
    const isLifePolicy = policy.product?.lineOfBusiness === LineOfBusiness.LIFE;
    const isTermLife = isLifePolicy && isTermLifeProduct(policy);
    const colDefs = isLifePolicy
        ? isTermLife
            ? TermLifeDetailsViewInfo()
            : PolicyDetailsViewInfo()
        : AnnuityDetailsViewInfo();

    return fillColDefs(dto, colDefs, t, 'colDefs:policyDetails');
};

/**
 * Takes in an array of key values and groups them into an array of objects by group label
 */
export const generateKeyValueGroups = (
    keyValues: DataDefinition<PolicyViewDetailsDto | AnnuityViewDetailsDto>[]
) => {
    const groupedObj = keyValues.reduce(
        (acc: Record<string, any[]>, keyValue) => {
            if (keyValue.groupLabel !== undefined && keyValue.group !== null) {
                if (acc[keyValue.groupLabel]) {
                    acc[keyValue.groupLabel].push(keyValue);
                } else {
                    acc[keyValue.groupLabel] = [keyValue];
                }
            }
            return acc;
        },
        {}
    );

    // Then transform the object into an array of the desired structure
    return Object.entries(groupedObj).map(([groupLabel, items]) => {
        // Find the group value from the first item in the array
        const group = items[0]?.group || '';

        return {
            group,
            groupLabel,
            items,
        };
    });
};
const splitIntoWords = (label: string) => {
    return label.replace(/([a-z])([A-Z])/g, '$1 $2');
};
const formatAsSentenceCase = (label: string) => {
    return label
        .replace(
            /\w+/g,
            (s) => {
                return s === s.toUpperCase() ? s : s.toLowerCase();
            } // Convert words to lowercase, unless they are abbreviations
        )
        .replace(
            /^./g,
            (s) => s.toUpperCase() // Capitalize the first letter of the sentence
        );
};
export const formatAsSectionLabel = (label: string) => {
    const words = splitIntoWords(label);
    const asSentence = formatAsSentenceCase(words);
    return asSentence;
};
const formatAsDataLabel = (label: string) => {
    if (exactTranslations[label]) {
        return exactTranslations[label];
    }
    const words = splitIntoWords(label);
    const formatted = Object.entries({
        ...industryTermToAbbrev,
        ...grammarCorrections,
    }).reduce(
        (acc, [key, val]) =>
            acc.replace(
                new RegExp(`\\b${key}\\b`, 'i'), // whole word match, case insensitive
                val
            ),
        words
    );
    const asSentence = formatAsSentenceCase(formatted);
    return asSentence;
};
const formatAsDataValue = (fieldData: FieldData, fieldName?: string) => {
    switch (true) {
        // Empty values
        case fieldData === null:
            return '--';

        // Enums
        case typeof fieldData === 'string' && !!enums[fieldData]:
            return enums[fieldData];

        // Currency
        case fieldName && currencyFields.has(fieldName):
            return numberFormatify(String(fieldData));

        // Dates
        case fieldName && dateFields.has(fieldName):
            return convertKebabedDateString(String(fieldData) || undefined);

        case typeof fieldData === 'object' && fieldData !== null:
            return JSON.stringify(fieldData, null, 2); // FIXME: should never be object
        default:
            return String(fieldData);
    }
};
export const formatDataField = ([fieldName, fieldData]: DataTuple): [
    string,
    string
] => {
    return [
        formatAsDataLabel(fieldName),
        formatAsDataValue(fieldData, fieldName),
    ];
};

export const toSections = (policy: Policy): PreparedPolicy => {
    const policyTuples = Object.entries(policy);
    return policyTuples.reduce<PreparedPolicy>(
        (acc, [currentKey, currentVal]) => {
            // append to policySections list
            if (typeof currentVal === 'object' && currentVal !== null) {
                switch (currentKey) {
                    case 'allocation':
                    case 'partyRoles':
                    case 'parties':
                        return acc;
                    default:
                        return {
                            ...acc,
                            policySections: [
                                ...acc.policySections,
                                [currentKey, currentVal],
                            ],
                        };
                }
            }

            // append to policyBasics list
            return {
                ...acc,
                policyBasics: [...acc.policyBasics, [currentKey, currentVal]],
            };
        },
        {
            policyBasics: [],
            policySections: [],
        }
    );
};

export const toFieldsAndSubsections = ([
    sectionName,
    sectionData,
]: PolicySection): PreparedPolicySection => {
    if (sectionData instanceof Array) {
        return {
            subSections: sectionData.map((subSection, i) => {
                const subsectionTitleField =
                    sectionTypeToSubsectionTitleFields[sectionName];
                const subSectionTitle = formatAsDataValue(
                    String(
                        subSection[subsectionTitleField] ??
                            `${sectionName} ${i + 1}`
                    )
                );
                const subSectionDataTuples = Object.entries(subSection).filter(
                    ([fieldName]) =>
                        fieldName !== subsectionTitleField && // remove the title field
                        !excludeFields.has(fieldName) // remove excluded fields
                );

                return [subSectionTitle, subSectionDataTuples];
            }),
        };
    } else {
        //FIXME: provision for tests
        const fields = Object.entries(sectionData).filter(
            ([fieldName]) => !excludeFields.has(fieldName) // remove excluded fields
        );
        return {
            fields,
        };
    }
};
