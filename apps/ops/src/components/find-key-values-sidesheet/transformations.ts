import {
    Policy,
    LineOfBusiness,
    LoanSegment,
    Fund,
    FundAllocation,
    Party,
} from '@xd/api-types/dist/generated-types/sor';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

import { currencyFields } from './translations/currency-fields';
import { dateFields } from './translations/date-fields';
import { enums } from './translations/enums';
import { exactTranslations } from './translations/exact';
import { excludeFields } from './translations/exclude-fields';
import { grammarCorrections } from './translations/grammar-corrections';
import { industryTermToAbbrev } from './translations/industry-term-to-abbrev';
import { sectionTypeToSubsectionTitleFields } from './translations/subsection-field-to-title';
import {
    DataKey,
    DataRecord,
    DataTuple,
    FieldData,
    label,
    link,
    Link,
    LinkedField,
    linkedField,
    PolicySection,
    PreparedPolicy,
    PreparedPolicySection,
    SubSection,
    Tags,
    tags,
} from './types';

/**
 * Given a policy, returns a factory that can be used to transform sections and tuples
 * of that policy into a format suitable for display in the find-key-values sidesheet.
 *
 * The returned factory retains the policy's line of business as a closure, and
 * provides the following methods:
 *
 * - `toSections(policyOverride)`: given a policy, returns section tuples
 * - `toFieldsAndSubsections(policySection)`: given a section of the policy,
 *   returns field tuples and subsection tuples.
 * - `formatDataField(dataTuple)`: given a tuple of a field name and its value,
 *   returns a tuple of a human-readable field name and field value.
 * - `formatAsSectionLabel(label)`: given a section label, returns a human-readable
 *   section label.
 *
 * @param policy The policy to transform
 * @returns A factory that can be used to split into sections,
 *          and transform field labels and values into human-readable strings
 *
 */
export const preparePolicy = (
    policy: Policy
): {
    lineOfBusiness: LineOfBusiness;
    allPartiesById?: Record<string, Party>;
    toSections: (policyOverride?: Policy) => PreparedPolicy;
    toFieldsAndSubsections: (
        policySection: PolicySection
    ) => PreparedPolicySection;
    formatDataField: (dataTuple: DataTuple) => [string, string] | null;
    formatAsSectionLabel: (label: string) => string;
} => {
    // retain persistent policy descriptors as closure
    const lineOfBusiness =
        policy.product?.lineOfBusiness ?? LineOfBusiness.OTHER;
    const allPartiesById = policy.parties
        ? convertListToMap({
              subSectionList: policy.parties,
              subsectionTitleField: 'partyId',
              fallbackTitle: 'Party',
          })
        : undefined;

    return {
        lineOfBusiness,
        allPartiesById,
        toSections: (policyOverride) =>
            toSections(policyOverride ?? policy, allPartiesById),
        toFieldsAndSubsections: (policySection: PolicySection) =>
            toFieldsAndSubsections(policySection),
        formatDataField: (dataTuple: DataTuple) =>
            formatDataField(dataTuple, lineOfBusiness),
        formatAsSectionLabel: (label: string) =>
            formatAsSectionLabel(label, lineOfBusiness),
    };
};

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
    lineOfBusiness: LineOfBusiness
) => {
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
const formatAsDataLabel = (label: string, lineOfBusiness: LineOfBusiness) => {
    if (exactTranslations[label]) {
        return exactTranslations[label];
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
    [fieldName, fieldData]: DataTuple,
    lineOfBusiness: LineOfBusiness
): [string, string] | null => {
    // Allow metadata (not rendered directly) via Symbols
    if (typeof fieldName !== 'string' || fieldData == null) return null;
    return [
        formatAsDataLabel(fieldName, lineOfBusiness),
        formatAsDataValue(fieldData, fieldName),
    ];
};

/**
 * Given a policy, returns a {@link PreparedPolicy} object containing two lists of data
 * tuples: `policyBasics` and `policySections`.
 *
 * `policyBasics` contains all top-level key-value pairs from the policy, filtered to only
 * include those that are not objects.
 *
 * `policySections` contains key-value pairs of section titles and their corresponding
 * section data.
 *
 * @param policy The policy to transform
 * @returns A {@link PreparedPolicy} object containing two lists of data tuples
 *
 */
export const toSections = (
    policy: Policy,
    allPartiesById?: Record<string, Party>
): PreparedPolicy => {
    const policyTuples = Object.entries(policy);

    // TODO: need to build a partyId map here

    const basicsAndSections = policyTuples.reduce<PreparedPolicy>(
        (acc, [currentKey, currentVal]) => {
            // append to policySections list
            if (typeof currentVal === 'object' && currentVal !== null) {
                const sectionTitle = currentKey;

                // find the field within the subsection tuples to use as the subsection title
                const subsectionTitleField =
                    sectionTypeToSubsectionTitleFields[sectionTitle];
                switch (sectionTitle) {
                    case 'allocation':
                        // combine fundAllocationsInvestments and funds into a flat map
                        const combinedFunds = policy.allocation?.funds?.map(
                            (fund, i) => {
                                return {
                                    ...policy.allocation
                                        ?.fundAllocationsInvestments?.[i],
                                    ...fund,
                                };
                            }
                        );
                        const funds = combinedFunds
                            ? convertListToMap<Fund & FundAllocation>({
                                  subSectionList: combinedFunds,
                                  subsectionTitleField,
                                  fallbackTitle: sectionTitle,
                              })
                            : undefined;
                        return {
                            ...acc,
                            policySections: [
                                ...acc.policySections,
                                [
                                    'Funds', // TODO: maybe convert from another map
                                    {
                                        ...currentVal,
                                        ...funds,
                                    },
                                ],
                            ],
                        };
                    case 'systematicPrograms':
                        const systematicProgramsAndParties =
                            policy.systematicPrograms?.map(
                                (systematicProgram) => {
                                    if (systematicProgram.parties?.length) {
                                        const parties =
                                            systematicProgram.parties?.map(
                                                (partyData, i) => {
                                                    const partyObj =
                                                        partyData.partyId &&
                                                        allPartiesById?.[
                                                            partyData.partyId
                                                        ];
                                                    if (!partyObj) {
                                                        return acc;
                                                    }
                                                    const partyName =
                                                        `${partyObj.firstName} ${partyObj.lastName}`.trim() ||
                                                        partyObj.fullName ||
                                                        `Party ${i + 1}`;

                                                    //TODO: move out of this function
                                                    const planCode =
                                                        policy.product
                                                            ?.planCode;
                                                    const policyNumber =
                                                        policy.policyNumber;
                                                    const partyLink = `/policies/${planCode}/${policyNumber}/people/${partyObj.partyId}`;
                                                    const firstBank =
                                                        partyObj
                                                            .bankDetails?.[0];
                                                    const bankInfo = firstBank
                                                        ? [
                                                              firstBank.branchName,
                                                              firstBank.accountType,
                                                              'ending in',
                                                              firstBank.accountNumber?.slice(
                                                                  -4
                                                              ),
                                                          ].join(' ')
                                                        : undefined;
                                                    const firstAddress =
                                                        partyObj.addresses?.[0];
                                                    const addressInfo =
                                                        firstAddress
                                                            ? [
                                                                  firstAddress.addressLine1,
                                                                  firstAddress.city,
                                                                  `${firstAddress.state} ${firstAddress.zipCode}`,
                                                              ].join(', ')
                                                            : undefined;

                                                    const completePartyData = {
                                                        partyId: partyName,
                                                        percentage:
                                                            partyData.percentage,
                                                        ...(bankInfo && {
                                                            bankId: bankInfo,
                                                        }),
                                                        ...(addressInfo && {
                                                            addressId:
                                                                addressInfo,
                                                        }),
                                                        paymentForm:
                                                            partyData.paymentForm,
                                                        [label]: partyName,
                                                        [link]: partyLink,
                                                        [linkedField]:
                                                            'partyId',
                                                        ...(partyData.partyRole && {
                                                            [tags]: [
                                                                formatAsDataValue(
                                                                    partyData.partyRole
                                                                ),
                                                            ],
                                                        }),
                                                    };
                                                    return completePartyData;
                                                    /*
                                            return {
                                                ...acc,
                                                [partyName]: completePartyData,
                                            };
                                            */
                                                }
                                            );

                                        return {
                                            ...systematicProgram,
                                            systematicProgramParties: parties,
                                        };
                                    }

                                    return {
                                        ...systematicProgram,
                                    };
                                }
                            );
                        //console.log('systematicProgramsAndParties', systematicProgramsAndParties);
                        //console.log('systematicProgramsCurrentVal', currentVal);

                        return {
                            ...acc,
                            policySections: [
                                ...acc.policySections,
                                [
                                    currentKey,
                                    systematicProgramsAndParties ?? currentVal,
                                ],
                            ],
                        };
                    case 'riders':
                        const ridersAndParticipants = policy.riders?.map(
                            (rider) => {
                                if (rider.riderParticipants?.length) {
                                    const parties =
                                        rider.riderParticipants?.map(
                                            (partyData, i) => {
                                                const partyObj =
                                                    partyData.partyId &&
                                                    allPartiesById?.[
                                                        partyData.partyId
                                                    ];
                                                if (!partyObj) {
                                                    return acc;
                                                }
                                                const partyName =
                                                    `${partyObj.firstName} ${partyObj.lastName}`.trim() ||
                                                    partyObj.fullName ||
                                                    `Party ${i + 1}`;

                                                //TODO: move out of this function
                                                const planCode =
                                                    policy.product?.planCode;
                                                const policyNumber =
                                                    policy.policyNumber;
                                                const partyLink = `/policies/${planCode}/${policyNumber}/people/${partyObj.partyId}`;

                                                const completePartyData = {
                                                    coveredParty: partyName,
                                                    partyAgeAtIssue:
                                                        partyData.partyAgeAtIssue,
                                                    [label]: partyName,
                                                    [link]: partyLink,
                                                    [linkedField]:
                                                        'coveredParty',
                                                };
                                                return completePartyData;
                                            }
                                        );

                                    return {
                                        ...rider,
                                        riderParties: parties,
                                    };
                                }

                                return {
                                    ...rider,
                                };
                            }
                        );

                        return {
                            ...acc,
                            policySections: [
                                ...acc.policySections,
                                [
                                    currentKey,
                                    ridersAndParticipants ?? currentVal,
                                ],
                            ],
                        };
                    case 'partyRoles':
                    case 'parties':
                        return acc;
                    case 'loanValues':
                        const loanSegments = policy.allocation?.loanSegments
                            ? convertListToMap<LoanSegment>({
                                  subSectionList:
                                      policy.allocation?.loanSegments,
                                  subsectionTitleField,
                                  fallbackTitle: sectionTitle,
                              })
                            : undefined;
                        return {
                            ...acc,
                            policySections: [
                                ...acc.policySections,
                                [
                                    'Loans',
                                    {
                                        ...currentVal,
                                        ...loanSegments,
                                    },
                                ],
                            ],
                        };
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

    // Fill in aggregated sections
    if (policy.allocation?.matchSegment) {
        basicsAndSections.policySections.push([
            'Match',
            policy.allocation?.matchSegment,
        ]);
    }

    const partyRoleMap = policy.partyRoles?.reduce<Record<string, string[]>>(
        (acc, currentPartyRole) => {
            const currentPartyIdRoles =
                (currentPartyRole.partyId && acc[currentPartyRole.partyId]) ||
                [];
            const combinedPartyRoles = {
                ...(currentPartyRole.partyId &&
                    currentPartyRole.partyRole && {
                        [currentPartyRole.partyId]: [
                            ...currentPartyIdRoles,
                            formatAsDataValue(currentPartyRole.partyRole),
                        ],
                    }),
            };
            return {
                ...acc,
                ...combinedPartyRoles,
            };
        },
        {}
    );

    //console.log('partyRoleMap...', partyRoleMap);
    //console.log('policy.parties...', policy.parties);

    const people = policy.parties?.reduce((acc, party, i) => {
        const partyName = String(
            `${party.firstName ?? ''} ${party.lastName ?? ''}`.trim() ||
                party.fullName ||
                `Party ${i + 1}`
        );

        if (!partyName) {
            return acc;
        }

        const planCode = policy.product?.planCode;
        const policyNumber = policy.policyNumber;
        const partyLink = `/policies/${planCode}/${policyNumber}/people/${party.partyId}`;
        const partyTags = party.partyId && partyRoleMap?.[party.partyId];
        const partyDetails = {
            partyName,
            dob: party.dateOfBirth,
            ssn: party.identifications?.find(
                (id) => id.identificationType === 'SSN'
            )?.identificationValue,
            ...(partyTags && { [tags]: partyTags }),
            ...(partyLink && { [link]: partyLink }),
            [linkedField]: 'partyName',
        };

        return {
            ...acc,
            [partyName]: partyDetails,
        };
    }, {});
    //console.log('people...', tags, people);

    if (people) {
        basicsAndSections.policySections.push(['People', people]);
    }

    return basicsAndSections;
};

// TODO: this could actually be useful as a util
const convertListToMap = <T extends DataRecord>({
    subSectionList,
    subsectionTitleField,
    fallbackTitle,
}: {
    subSectionList: T[];
    subsectionTitleField: string;
    fallbackTitle: string;
}) => {
    const subSectionMap = subSectionList?.reduce<Record<DataKey, T>>(
        (acc, currentSubSection, i) => {
            // Grab the first value to represent the title of the segment

            const subSectionTitle = formatAsDataValue(
                currentSubSection[subsectionTitleField] ??
                    Object.values(currentSubSection)[0] ??
                    `${fallbackTitle} ${i + 1}`
            );

            return {
                ...acc,
                [subSectionTitle]: currentSubSection,
            };
        },
        {}
    );

    return subSectionMap;
};

/**
 * Given a policy section, returns a {@link PreparedPolicySection} object
 * containing an array of field/data tuples and/or an array of subsections.
 *
 * If the section data is an array, each item in the array is treated as a
 * subsection, nested under "subSections". The title of each subsection will
 * map from a defined field *within* that subsection using the
 * {@link sectionTypeToSubsectionTitleFields} mapping.
 *
 * If the section data is an object, and a value within it is a nested object,
 * it is also treated as a subsection (also nested under "subSections"), but
 * the subsection title is mapped to the object key.
 *
 * Otherwise, the value is meant to be displayed, so just it is just returned
 * as key-value pairs of field names and field values, nested under "fields".
 *
 * @param policySection The policy section to transform
 * @param lineOfBusiness The line of business for the policy
 * @returns A {@link PreparedPolicySection} object containing an array of field/data tuples
 *          and/or an array of subsections
 */

export const toFieldsAndSubsections = ([
    sectionName,
    sectionData,
]: PolicySection): PreparedPolicySection => {
    // If sectionData is an array, treat each item as a subsection.
    // The title of each subsection will map from a defined field *within* that subsection
    if (sectionData instanceof Array) {
        const subsectionTitleField =
            sectionTypeToSubsectionTitleFields[sectionName];
        const subSectionDataMap = convertListToMap({
            subSectionList: sectionData,
            subsectionTitleField,
            fallbackTitle: String(sectionName),
        });
        //console.log('|-------->sectionData', sectionData);
        const subSections = removeExcludedFields(
            Object.entries(subSectionDataMap), // remove excluded subsections
            [subsectionTitleField] // and also the title field
        ).map<SubSection>(([subSectionTitle, subSectionData]) => {
            //console.log('|---------->subSectionData', subSectionData);
            return [
                subSectionTitle,
                Array.isArray(subSectionData)
                    ? subSectionData
                    : subSectionData === null
                    ? []
                    : // map subsection fields to tuples and
                      // remove excluded fields within subsection
                      removeExcludedFields(Object.entries(subSectionData)),
            ];
        });

        return {
            subSections,
        };
    } else {
        //console.log('sectionData', sectionData);
        const { fields, subSections } = removeExcludedFields(
            Object.entries(sectionData)
        ).reduce<PreparedPolicySection>((acc, [fieldName, fieldData]) => {
            // If sectionData is an object, and a value within it is a nested object,
            // also treat it as a subsection, but map the subsection title to the object key
            if (typeof fieldData === 'object' && fieldData !== null) {
                const fieldTags = (fieldData as Tags)[tags];
                const fieldLink = (fieldData as Link)[link];

                // One field per section can be a link
                const fieldLinkedField = (fieldData as LinkedField)[
                    linkedField
                ];

                return {
                    fields: acc.fields, // keep fields untouched
                    subSections: [
                        ...(acc.subSections ?? []),
                        [
                            fieldName,
                            removeExcludedFields(Object.entries(fieldData)),

                            // Add metadata
                            {
                                [tags]: fieldTags,
                                [link]: fieldLink,
                                [linkedField]: fieldLinkedField,
                            },
                        ],
                    ],
                };
            }

            // Otherwise, the value is meant to be displayed, so just append the key-value pair
            return {
                fields: removeExcludedFields([
                    ...(acc.fields ?? []),
                    [fieldName, fieldData],
                ]),
                subSections: acc.subSections, // keep subsections untouched
            };
        }, {});

        return {
            fields,
            subSections,
        };
    }
};

const removeExcludedFields = (
    tuples: DataTuple[],
    additionalFieldsToExclude?: DataKey[]
) => {
    return tuples.filter(
        ([key]) =>
            !excludeFields.has(key) &&
            !(
                additionalFieldsToExclude &&
                new Set(additionalFieldsToExclude).has(key)
            )
    );
};
