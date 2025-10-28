import {
    Policy,
    LineOfBusiness,
    LoanSegment,
    Fund,
    FundAllocation,
    Party,
    ProductType,
    Transaction,
} from '@xd/api-types/dist/generated-types/sor';
import { TFunction } from 'next-i18next';

import {
    formatDataField,
    formatAsSectionLabel,
    removeExcludedAndEmptyFields,
    formatAsDataValue,
} from './formatters';
import { sectionVisibility } from './translations/section-visibility';
import { sectionTypeToSubSectionTitleFields } from './translations/subsection-field-to-title';
import {
    NestedData,
    label,
    tags,
    link,
    linkedField,
    MetaData,
    Section,
    FormatterType,
} from './types';

/**
 * Prepare a policy for rendering sections and fields.
 *
 * The function takes in a policy, a translation function, and an optional search value.
 * It returns an object with the following properties:
 * - lineOfBusiness: The line of business for the policy (e.g. LIFE, ANNUITY, etc.)
 * - planCode: The plan code for the policy (e.g. 12345)
 * - productType: The product type for the policy (e.g. TERM_LIFE, WHOLE_LIFE, etc.)
 * - allPartiesById: A record of parties by their IDs
 * - toSections: A function that takes in an optional policy override and returns an object with two properties: policyBasics and policySections.
 * - formatAsSectionLabel: A function that takes in a label and returns a formatted string for the section label, based on the line of business and translation function.
 *
 * The function is used to prepare a policy for rendering sections and fields.
 *
 * @param policy The policy to prepare
 * @param t The translation function
 * @param searchValue The search value to filter sections and fields by
 * @returns An object with the prepared policy properties
 */
export const preparePolicy = ({
    policy,
    t,
    searchValue,
}: {
    policy: Policy;
    t: TFunction;
    searchValue?: string;
}): {
    lineOfBusiness: LineOfBusiness;
    planCode?: string;
    productType?: ProductType;
    allPartiesById?: Record<string, Party>;
    toSections: (policyOverride?: Policy) => {
        policyBasics: NestedData[] | null;
        policySections: Section[];
    };
    formatAsSectionLabel: (label: string) => string;
} => {
    // retain persistent policy descriptors as closure
    const lineOfBusiness =
        policy.product?.lineOfBusiness ?? LineOfBusiness.OTHER;
    const planCode = policy.product?.planCode;
    const productType = policy.product?.productType;
    const allPartiesById = policy.parties
        ? convertListToMap({
              subSectionList: policy.parties,
              subSectionTitleField: 'partyId',
              fallbackTitle: 'Party',
          })
        : undefined;

    return {
        lineOfBusiness,
        planCode,
        productType,
        allPartiesById,
        toSections: (policyOverride) => {
            return toSections(
                policyOverride ?? policy,
                t,
                searchValue,
                planCode,
                productType,
                allPartiesById
            );
        },
        formatAsSectionLabel: (label: string) =>
            formatAsSectionLabel(label, lineOfBusiness, t),
    };
};

export const prepareTransaction = ({
    transaction,
    policy,
    t,
    searchValue,
}: {
    transaction: Transaction;
    policy: Policy;
    t: TFunction;
    searchValue?: string;
}) => {
    const allPartiesById = convertListToMap({
        subSectionList: policy.parties ?? [],
        subSectionTitleField: 'partyId',
        fallbackTitle: 'Party',
    });

    return {
        toTransactionSections: (transactionOverride?: Transaction) => {
            return toTransactionSections(
                transactionOverride ?? transaction,
                policy,
                allPartiesById,
                t,
                searchValue
            );
        },
        formatAsSectionLabel: (label: string) =>
            formatAsSectionLabel(
                label,
                policy.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                t
            ),
    };
};

/**
 * Given a policy, returns an object containing two lists of data
 * tuples: `policyBasics` and `policySections`.
 *
 * @param policy The policy to transform
 * @param lineOfBusiness The line of business to apply filtering rules to
 * @param productType The product type to apply filtering rules to
 * @param allPartiesById The mapping of party IDs to party objects
 * @returns A {@link PreparedPolicy} object
 */
export const toSections = (
    policy: Policy,
    t: TFunction,
    searchValue?: string,
    planCode?: string,
    productType?: ProductType,
    allPartiesById?: Record<string, Party>
): {
    policyBasics: NestedData[] | null;
    policySections: Section[];
} => {
    const policyTuples = Object.entries(policy);
    const basicsAndSections = policyTuples.reduce(
        (
            acc,
            [currentKey, currentVal]
        ): {
            policyBasics: NestedData[] | null;
            policySections: Section[];
        } => {
            // If the value is an object, treat it as a section
            if (typeof currentVal === 'object') {
                const sectionTitle = currentKey;

                // If there are rules to hide this section,
                // or if the section is empty, skip it
                if (
                    !shouldShowSection(
                        sectionTitle,
                        policy?.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                        planCode,
                        productType
                    ) ||
                    currentVal == null
                ) {
                    return acc;
                }

                // Find the field within the subsection tuples to use as the subsection title
                const subSectionTitleField =
                    sectionTypeToSubSectionTitleFields[sectionTitle];
                switch (sectionTitle) {
                    case 'allocation':
                        return parseAllocation(
                            policy,
                            subSectionTitleField,
                            sectionTitle,
                            t,
                            acc,
                            currentVal as Policy['allocation']
                        );
                    case 'systematicPrograms':
                        return parseSystematicPrograms(
                            policy,
                            allPartiesById,
                            t,
                            policy?.product?.lineOfBusiness ??
                                LineOfBusiness.OTHER,
                            acc,
                            currentKey,
                            currentVal as Policy['systematicPrograms']
                        );
                    case 'riders':
                        return parseRiders(
                            policy,
                            allPartiesById,
                            t,
                            acc,
                            currentKey,
                            currentVal as Policy['riders']
                        );
                    case 'loanValues':
                        // Loan segments are split from the Allocation section
                        return parseLoanValues(
                            policy,
                            subSectionTitleField,
                            sectionTitle,
                            t,
                            acc,
                            currentVal as Policy['loanValues']
                        );
                    default:
                        return {
                            ...acc,
                            policySections: [
                                ...acc.policySections,
                                [currentKey, currentVal] as Section,
                            ],
                        };
                }
            }

            // Otherwise, the value is a primitive, so add it to the policy basics
            // formatDataField will determine if the field should be shown
            const formattedField = formatDataField(
                [currentKey, currentVal],
                policy.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                t,
                FormatterType.POLICY,
                searchValue
            );

            return {
                ...acc,
                ...(formattedField && {
                    policyBasics: [...(acc.policyBasics ?? []), formattedField],
                }),
            };
        },

        {
            policyBasics: null,
            policySections: [],
        }
    );

    // Fill in aggregated sections
    const nonNullMatchEntries = Object.entries(
        policy.allocation?.matchSegment ?? {}
    ).filter(([, data]) => data != null);
    if (nonNullMatchEntries.length) {
        basicsAndSections.policySections.push([
            String(t('allFields.match')),
            Object.fromEntries(nonNullMatchEntries),
        ]);
    }

    // Fill in the people section
    const people = parsePeople(policy, allPartiesById, t);
    if (people) {
        basicsAndSections.policySections.push([
            String(t('allFields.people')),
            people,
        ] as Section);
    }

    // Fill in the section title
    if (basicsAndSections.policyBasics != null) {
        (basicsAndSections.policyBasics as MetaData)[label] =
            formatAsSectionLabel(
                'policyBasics',
                policy.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                t
            );
    }

    return {
        policyBasics: basicsAndSections.policyBasics,
        policySections: basicsAndSections.policySections
            ?.map((policySection) => {
                const fieldsAndSubsections = toFieldsAndSubsections(
                    policySection,
                    policy?.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                    t,
                    FormatterType.POLICY,
                    searchValue
                );

                return fieldsAndSubsections.fields?.length ||
                    fieldsAndSubsections.subSections?.length
                    ? [policySection[0], fieldsAndSubsections]
                    : null;
            })
            .filter((section) => section != null) as Section[],
    };
};

export const toTransactionSections = (
    transaction: Transaction,
    policy: Policy,
    allPartiesById: Record<string, Party>,
    t: TFunction,
    searchValue?: string
): {
    transactionDetails: NestedData[] | null;
    transactionSections: Section[];
} => {
    const transactionTuples = Object.entries(transaction);
    const basicsAndSections = transactionTuples.reduce(
        (
            acc,
            [currentKey, currentVal]
        ): {
            transactionDetails: NestedData[] | null;
            transactionSections: Section[];
        } => {
            // If the value is an object, treat it as a section
            if (typeof currentVal === 'object') {
                const sectionTitle = currentKey;
                if (currentVal == null) {
                    return acc;
                }

                // Find the field within the subsection tuples to use as the subsection title
                // const subSectionTitleField =
                //     sectionTypeToSubSectionTitleFields[sectionTitle];
                switch (sectionTitle) {
                    default:
                        return {
                            ...acc,
                            transactionSections: [
                                ...acc.transactionSections,
                                [currentKey, currentVal] as Section,
                            ],
                        };
                }
            }

            // Otherwise, the value is a primitive, so add it to the policy basics
            // formatDataField will determine if the field should be shown
            const formattedField = formatDataField(
                [currentKey, currentVal],
                policy.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                t,
                FormatterType.TRANSACTION,
                searchValue
            );

            return {
                ...acc,
                ...(formattedField && {
                    transactionDetails: [
                        ...(acc.transactionDetails ?? []),
                        formattedField,
                    ],
                }),
            };
        },

        {
            transactionDetails: null,
            transactionSections: [],
        }
    );

    // Fill in the people section
    const people = parsePeople(policy, allPartiesById, t);
    if (people) {
        basicsAndSections.transactionSections.push([
            String(t('allFields.payorPayeeDetails')),
            people,
        ] as Section);
    }

    // Fill in the section title
    if (basicsAndSections.transactionDetails != null) {
        (basicsAndSections.transactionDetails as MetaData)[label] =
            formatAsSectionLabel(
                'transactionDetails',
                policy.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                t
            );
    }

    return {
        transactionDetails: basicsAndSections.transactionDetails,
        transactionSections: basicsAndSections.transactionSections
            ?.map((transactionSection) => {
                const fieldsAndSubsections = toFieldsAndSubsections(
                    transactionSection,
                    policy?.product?.lineOfBusiness ?? LineOfBusiness.OTHER,
                    t,
                    FormatterType.TRANSACTION,
                    searchValue
                );

                return fieldsAndSubsections.fields?.length ||
                    fieldsAndSubsections.subSections?.length
                    ? [transactionSection[0], fieldsAndSubsections]
                    : null;
            })
            .filter((section) => section != null) as Section[],
    };
};

/**
 * Given a party ID, a map of party IDs to party objects, a policy, and the name of the field
 * that the party ID is associated with, returns an object containing the party name and a link to the
 * party's details page.
 *
 * @param {object} obj containing the following properties:
 * @param {string} [obj.partyId] the ID of the party to fetch
 * @param {object} [obj.allPartiesById] a map of party IDs to party objects
 * @param {object} obj.policy the policy that the party is associated with
 * @param {string} obj.idFieldName the name of the field that the party ID is associated with
 * @param {function} t the translation function
 * @returns an object containing the party name and a link to the party's details page, or undefined if
 * the party ID or map of party IDs is null
 */
const fillInRequiredPartyDetails = ({
    partyId,
    allPartiesById,
    policy,
    idFieldName,
}: {
    partyId?: string;
    allPartiesById?: Record<string, Party>;
    policy: Policy;
    idFieldName: string;
}) => {
    if (partyId == null || allPartiesById == null) {
        return undefined;
    }
    const partyObj = allPartiesById[partyId];

    if (!partyObj) {
        return undefined;
    }
    const partyName =
        `${partyObj.firstName ?? ''} ${partyObj.lastName ?? ''}`.trim() ||
        partyObj.fullName;

    if (!partyName) {
        return undefined;
    }

    const planCode = policy.product?.planCode;
    const policyNumber = policy.policyNumber;
    const partyLink = `/policies/${planCode}/${policyNumber}/people/${partyObj.partyId}`;

    const additionalPartyData = {
        [idFieldName]: partyName,
        [label]: partyName,
        [link]: partyLink,
        [linkedField]: idFieldName,
    };
    return additionalPartyData;
};

/**
 * Given a party ID and a map of party IDs to party objects, returns an object containing the first bank's
 * information and the first address's information, or undefined if the party ID or map of party IDs is null.
 *
 * @param {object} obj containing the following properties:
 * @param {string} [obj.partyId] the ID of the party to fetch
 * @param {object} [obj.allPartiesById] a map of party IDs to party objects
 * @param {function} t the translation function
 * @returns an object containing the first bank's information and the first address's information, or undefined if
 * the party ID or map of party IDs is null
 */
const fillInBankAndAddressInfo = (
    {
        partyId,
        allPartiesById,
    }: {
        partyId?: string;
        allPartiesById?: Record<string, Party>;
    },
    t: TFunction
) => {
    if (partyId == null || allPartiesById == null) {
        return undefined;
    }
    const partyObj = allPartiesById[partyId];

    if (!partyObj) {
        return undefined;
    }

    const firstBank = partyObj.bankDetails?.[0];
    const bankInfo = firstBank
        ? [
              firstBank.branchName,
              firstBank.accountType ?? null,
              t('policy.commonPhrases.endingIn'),
              firstBank.accountNumber?.slice(-4),
          ].join(' ')
        : undefined;
    const firstAddress = partyObj.addresses?.[0];
    const addressInfo = firstAddress
        ? [
              firstAddress.addressLine1,
              firstAddress.city,
              `${firstAddress.state} ${firstAddress.zipCode}`,
          ].join(', ')
        : undefined;

    return {
        bankInfo,
        addressInfo,
    };
};

/**
 * Given a section name and section data, returns a nested data tuple containing the fields and subsections.
 * If the section data is an array, each item is treated as a subsection.
 * The title of each subsection will map from a defined field *within* that subsection
 * If the section data is an object, and a value within it is a nested object,
 * also treat it as a subsection, but map the subsection title to the object key
 * @param sectionName The name of the section
 * @param sectionData The data of the section
 * @param lineOfBusiness The line of business of the policy
 * @param t The translation function
 * @param searchValue The search value to highlight
 * @returns A nested data tuple containing the fields and subsections
 */
export const toFieldsAndSubsections = (
    [sectionName, sectionData]: [string, unknown[] | Record<string, unknown>],
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    type: FormatterType,
    searchValue?: string
): {
    fields?: NestedData;
    subSections?: NestedData;
} => {
    const subSectionTitleField =
        sectionTypeToSubSectionTitleFields[sectionName];

    // If sectionData is an array, treat each item as a subsection.
    // The title of each subsection will map from a defined field *within* that subsection
    if (sectionData instanceof Array) {
        const subSections = sectionData
            .map((subSection) => {
                if (subSection == null) {
                    return null;
                }
                const subSectionLabel = String(
                    (subSection as MetaData)[label] ??
                        (subSection as Record<string, unknown>)[
                            subSectionTitleField
                        ]
                );
                const subSectionLink = (subSection as MetaData)[link];
                const subSectionLinkedField = (subSection as MetaData)[
                    linkedField
                ];
                const subSectionTags = (subSection as MetaData)[tags];
                const subSectionEntries = removeExcludedAndEmptyFields(
                    Object.entries(subSection),
                    lineOfBusiness,
                    t,
                    type,
                    subSectionLink,
                    subSectionLinkedField,
                    searchValue,
                    [subSectionTitleField]
                );

                if (!subSectionEntries?.length) {
                    return null;
                }

                const subSectionTuple = [
                    formatAsDataValue(subSectionLabel, t),
                    subSectionEntries,
                ];
                (subSectionTuple as MetaData)[tags] = subSectionTags;

                return subSectionTuple;
            })
            .filter((subSection) => subSection !== null);

        return subSections.length
            ? {
                  subSections: subSections as NestedData,
              }
            : {};
    } else {
        const fields = Object.entries(sectionData)
            .map(([subSectionName, fieldData]) => {
                // If sectionData is an object, and a value within it is a nested object,
                // also treat it as a subsection, but map the subsection title to the object key
                if (fieldData instanceof Array) {
                    const fieldEntries = fieldData
                        .map((fieldObj) => {
                            if (
                                typeof fieldObj !== 'object' ||
                                fieldObj == null ||
                                !(subSectionTitleField in fieldObj)
                            ) {
                                return null;
                            }
                            const fieldLabel = fieldObj[subSectionTitleField];
                            const fieldEntry = Object.entries(fieldObj);
                            const subSectionData = removeExcludedAndEmptyFields(
                                fieldEntry as NestedData,
                                lineOfBusiness,
                                t,
                                type,
                                undefined,
                                undefined,
                                searchValue
                            );

                            if (subSectionData == null) {
                                return null;
                            }

                            (subSectionData as MetaData)[label] = fieldLabel;
                            return subSectionData;
                        })
                        .filter((fieldEntry) => fieldEntry !== null);

                    // Only show non-empty subsections
                    if (fieldEntries?.length) {
                        return fieldEntries;
                    }

                    return null;
                } else if (typeof fieldData === 'object' && fieldData != null) {
                    // In some cases the data is a nested object, so it needs a label
                    (fieldData as MetaData)[label] = formatAsSectionLabel(
                        subSectionName,
                        lineOfBusiness,
                        t
                    );
                }

                // Otherwise, the value is meant to be displayed, so just append the key-value pair
                return formatDataField(
                    [subSectionName, fieldData] as NestedData,
                    lineOfBusiness,
                    t,
                    type,
                    searchValue
                );
            })
            .filter((field) => field !== null);
        return {
            fields,
        };
    }
};

/**
 * Maps a list of subsections to a map with the title of each subsection as the key.
 * The title of each subsection is determined by the first value of the subsection
 * represented by the subSectionTitleField, or the fallbackTitle if the subsection does not
 * contain the subSectionTitleField.
 * @param {{subSectionList, subSectionTitleField, fallbackTitle}} params
 * @param {TFunction} t The translation function
 * @returns {Record<string, T>} A map of subsections with the title as the key
 */
const convertListToMap = <T>({
    subSectionList,
    subSectionTitleField,
    fallbackTitle,
}: {
    subSectionList: T[];
    subSectionTitleField: string;
    fallbackTitle: string;
}) => {
    const subSectionMap = subSectionList?.reduce<Record<string, T>>(
        (acc, currentSubSection, i) => {
            // Grab the first value to represent the title of the segment

            const subSectionTitle =
                (currentSubSection as Record<string, T>)[
                    subSectionTitleField
                ] ??
                Object.values(currentSubSection as T[])[0] ??
                `${fallbackTitle} ${i + 1}`;

            return {
                ...acc,
                [String(subSectionTitle)]: currentSubSection, // FIXME
            };
        },
        {}
    );

    return subSectionMap;
};

/**
 * Given a section label, a line of business, and optionally a plan code and product type,
 * determines whether the section should be shown.
 *
 * @param sectionLabel The section label to check
 * @param lineOfBusiness The line of business for the policy
 * @param planCode The plan code for the policy, if applicable
 * @param productType The product type for the policy, if applicable
 * @returns {boolean} Whether the section should be shown
 */
const shouldShowSection = (
    sectionLabel: string,
    lineOfBusiness: LineOfBusiness,
    planCode?: string,
    productType?: ProductType
) => {
    const sectionRule = sectionVisibility[sectionLabel];

    return (
        !sectionRule ||
        (planCode && sectionRule.has(planCode)) ||
        sectionRule.has(lineOfBusiness) ||
        (productType && sectionRule.has(productType))
    );
};
/**
 * Given a policy, a map of party IDs to party roles.
 *
 * @param policy The policy to transform
 * @param allPartiesById The mapping of party IDs to party objects
 * @param t The translation function
 * @param lineOfBusiness The line of business for the policy
 * @returns A nested data tuple containing the policy's People section
 */
function parsePeople(
    policy: Policy,
    allPartiesById: Record<string, Party> | undefined,
    t: TFunction
) {
    // Make a map of party roles to reference as tags for the People section
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
                            currentPartyRole.partyRole,
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

    // Populate the People section
    const people = policy.parties
        ?.map((party) => {
            const requiredPartyData = fillInRequiredPartyDetails({
                partyId: party.partyId,
                policy,
                idFieldName: 'partyName',
                allPartiesById,
            });

            if (!requiredPartyData) {
                return undefined;
            }

            const partyTags = party.partyId && partyRoleMap?.[party.partyId];
            const ssn = party.identifications?.find(
                (id) => id.identificationType === 'SSN'
            )?.identificationValue;
            const partyDetails = {
                ...requiredPartyData,
                ...(party.dateOfBirth && { dob: party.dateOfBirth }),
                ...(ssn && { ssn }),
                ...(partyTags && {
                    [tags]: partyTags.map((tag) => formatAsDataValue(tag, t)),
                }),
            };

            return partyDetails;
        })
        .filter((p) => p != null);
    return people;
}

/**
 * Maps the LoanValues section of the policy into a nested data tuple.
 * Combines loanSegments into a flat map.
 * @param policy The policy to transform
 * @param subSectionTitleField The field that maps to the subsection title
 * @param sectionTitle The title of the section
 * @param t The translation function
 * @param acc The accumulator object containing the policyBasics and policySections
 * @param currentVal The current value of the LoanValues section
 * @returns The updated accumulator object containing the policyBasics and policySections
 */
function parseLoanValues(
    policy: Policy,
    subSectionTitleField: string,
    sectionTitle: string,
    t: TFunction,
    acc: {
        policyBasics: NestedData[] | null;
        policySections: Section[];
    },
    currentVal: Policy['loanValues']
) {
    const loanSegments = policy.allocation?.loanSegments
        ? convertListToMap<LoanSegment>({
              subSectionList: policy.allocation?.loanSegments,
              subSectionTitleField,
              fallbackTitle: sectionTitle,
          })
        : undefined;
    return {
        ...acc,
        policySections: [
            ...acc.policySections,
            [
                'loans',
                {
                    ...currentVal,
                    ...loanSegments,
                },
            ] as Section,
        ],
    };
}

/**
 * Maps the Riders section of the policy into a nested data tuple.
 * Combines riders and riderParticipants into a flat map.
 * @param policy The policy to transform
 * @param allPartiesById The mapping of party IDs to party objects
 * @param t The translation function
 * @param acc The accumulator object containing the policyBasics and policySections
 * @param currentKey The current key being processed
 * @param currentVal The current value of the Riders section
 * @returns The updated accumulator object containing the policyBasics and policySections
 */
function parseRiders(
    policy: Policy,
    allPartiesById: Record<string, Party> | undefined,
    t: TFunction,
    acc: {
        policyBasics: NestedData[] | null;
        policySections: Section[];
    },
    currentKey: string,
    currentVal: Policy['riders']
) {
    const ridersAndParticipants = policy.riders?.map((rider) => {
        // Party name is mapped from the partyId-to-party map
        // on the PreparedPolicy
        const parties = rider.riderParticipants?.map((partyData) => {
            const requiredPartyData = fillInRequiredPartyDetails({
                partyId: partyData.partyId,
                policy,
                idFieldName: 'coveredParty',
                allPartiesById,
            });

            if (!requiredPartyData) {
                return undefined;
            }

            const completePartyData = {
                ...requiredPartyData,
                partyAgeAtIssue: partyData.partyAgeAtIssue,
            };

            return completePartyData;
        });

        return {
            ...rider,
            ...(parties && { riderParties: parties }),
        };
    });

    return {
        ...acc,
        policySections: [
            ...acc.policySections,
            [currentKey, ridersAndParticipants ?? currentVal] as Section,
        ],
    };
}

/**
 * Given a policy, returns a list of systematic programs and their associated parties.
 *
 * The returned list contains the following fields:
 * - systematicPrograms: an array of SystematicProgram objects
 * - systematicProgramParties: an array of party objects associated with each systematic program
 *
 * @param policy The policy to transform
 * @param allPartiesById The mapping of party IDs to party objects
 * @param t The translation function
 * @param lineOfBusiness The line of business to apply filtering rules to
 * @param acc The accumulator object for the policy sections and baselines
 * @param currentKey The current key being processed
 * @param currentVal The current value being processed
 * @returns An object containing the transformed policy sections and baselines
 */
function parseSystematicPrograms(
    policy: Policy,
    allPartiesById: Record<string, Party> | undefined,
    t: TFunction,
    lineOfBusiness: LineOfBusiness,
    acc: {
        policyBasics: NestedData[] | null;
        policySections: Section[];
    },
    currentKey: string,
    currentVal: Policy['systematicPrograms']
) {
    const systematicProgramsAndParties = policy.systematicPrograms?.map(
        (systematicProgram) => {
            // Party name, bank info, and address are mapped from
            // the partyId-to-party map on the PreparedPolicy
            const parties = systematicProgram.parties?.map((partyData) => {
                const requiredPartyData = fillInRequiredPartyDetails({
                    partyId: partyData.partyId,
                    policy,
                    idFieldName: 'partyId',
                    allPartiesById,
                });

                if (!requiredPartyData) {
                    return undefined;
                }

                const partyBankAndAddress = fillInBankAndAddressInfo(
                    {
                        partyId: partyData.partyId,
                        allPartiesById,
                    },
                    t
                );

                const completePartyData = {
                    ...requiredPartyData,
                    ...partyBankAndAddress,
                    percentage: partyData.percentage,
                    paymentForm: partyData.paymentForm,
                    ...(partyData.partyRole && {
                        [tags]: [formatAsDataValue(partyData.partyRole, t)],
                    }),
                };

                return completePartyData;
            });

            return {
                ...systematicProgram,
                ...(parties && {
                    systematicProgramParties: parties,
                }),
            };
        }
    );
    return {
        ...acc,
        policySections: [
            ...acc.policySections,
            [currentKey, systematicProgramsAndParties ?? currentVal] as Section,
        ],
    };
}

/**
 * Maps the Allocation section of the policy into a nested data tuple.
 * Combines fundAllocationsInvestments and funds into a flat map.
 * @param policy The policy to transform
 * @param subSectionTitleField The field that maps to the subsection title
 * @param sectionTitle The title of the section
 * @param t The translation function
 * @param acc The accumulator object containing the policyBasics and policySections
 * @param currentVal The current value of the Allocation section
 * @returns The updated accumulator object containing the policyBasics and policySections
 */
function parseAllocation(
    policy: Policy,
    subSectionTitleField: string,
    sectionTitle: string,
    t: TFunction,
    acc: {
        policyBasics: NestedData[] | null;
        policySections: Section[];
    },
    currentVal: Policy['allocation']
) {
    // Funds are mapped from the Allocation section, minus the loanSegments subsections
    // Combine fundAllocationsInvestments and funds into a flat map

    const combinedFunds = policy.allocation?.funds?.map((fund, i) => {
        return {
            ...policy.allocation?.fundAllocationsInvestments?.[i],
            ...fund,
        };
    });
    const funds = combinedFunds?.length
        ? convertListToMap<Fund & FundAllocation>({
              subSectionList: combinedFunds,
              subSectionTitleField,
              fallbackTitle: sectionTitle,
          })
        : undefined;

    return {
        ...acc,
        ...(funds && {
            policySections: [
                ...acc.policySections,
                [
                    'combinedFunds',
                    {
                        ...currentVal,
                        ...funds,
                    },
                ] as Section,
            ],
        }),
    };
}
