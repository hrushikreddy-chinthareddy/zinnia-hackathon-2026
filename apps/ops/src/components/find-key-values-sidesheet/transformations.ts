import {
    Policy,
    LineOfBusiness,
    LoanSegment,
    Fund,
    FundAllocation,
    Party,
    ProductType,
} from '@xd/api-types/dist/generated-types/sor';
import { TFunction } from 'next-i18next';

import {
    formatDataField,
    formatAsSectionLabel,
    formatAsDataValue,
} from './formatters';
import { excludeFields } from './translations/exclude-fields';
import { sectionVisibility } from './translations/section-visibility';
import { sectionTypeToSubSectionTitleFields } from './translations/subsection-field-to-title';
import {
    DataKey,
    DataRecord,
    DataTuple,
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
 *          and transform field labels and values into human-readable strings.
 *          The factory retains the policy's line of business, product type,
 *          and mapping of all parties as a closure.
 */
export const preparePolicy = (
    policy: Policy,
    t: TFunction
): {
    lineOfBusiness: LineOfBusiness;
    planCode?: string;
    productType?: ProductType;
    allPartiesById?: Record<string, Party>;
    t: TFunction;
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
    const planCode = policy.product?.planCode;
    const productType = policy.product?.productType;
    const allPartiesById = policy.parties
        ? convertListToMap(
              {
                  subSectionList: policy.parties,
                  subSectionTitleField: 'partyId',
                  fallbackTitle: 'Party',
              },
              t
          )
        : undefined;

    return {
        lineOfBusiness,
        planCode,
        productType,
        allPartiesById,
        t,
        toSections: (policyOverride) =>
            toSections(
                policyOverride ?? policy,
                lineOfBusiness,
                t,
                planCode,
                productType,
                allPartiesById
            ),
        toFieldsAndSubsections: (policySection: PolicySection) =>
            toFieldsAndSubsections(policySection, lineOfBusiness, t),
        formatDataField: (dataTuple: DataTuple) =>
            formatDataField(dataTuple, lineOfBusiness, t),
        formatAsSectionLabel: (label: string) =>
            formatAsSectionLabel(label, lineOfBusiness, t),
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
    lineOfBusiness: LineOfBusiness,
    t: TFunction,
    planCode?: string,
    productType?: ProductType,
    allPartiesById?: Record<string, Party>
): PreparedPolicy => {
    const policyTuples = Object.entries(policy);
    const basicsAndSections = policyTuples.reduce<PreparedPolicy>(
        (acc, [currentKey, currentVal]) => {
            // If the value is an object, treat it as a section
            if (typeof currentVal === 'object') {
                const sectionTitle = currentKey;

                // If there are rules to hide this section,
                // or if the section is empty, skip it
                if (
                    !shouldShowSection(
                        sectionTitle,
                        lineOfBusiness,
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
                        // Funds are mapped from the Allocation section, minus the loanSegments subsections
                        // Combine fundAllocationsInvestments and funds into a flat map
                        const combinedFunds = policy.allocation?.funds?.map(
                            (fund, i) => {
                                return {
                                    ...policy.allocation
                                        ?.fundAllocationsInvestments?.[i],
                                    ...fund,
                                };
                            }
                        );
                        const funds = combinedFunds?.length
                            ? convertListToMap<Fund & FundAllocation>(
                                  {
                                      subSectionList: combinedFunds,
                                      subSectionTitleField,
                                      fallbackTitle: sectionTitle,
                                  },
                                  t
                              )
                            : undefined;
                        return {
                            ...acc,
                            ...(funds && {
                                policySections: [
                                    ...acc.policySections,
                                    [
                                        String(t('policy.allFields.funds')), // TODO: maybe convert from another map
                                        {
                                            ...currentVal,
                                            ...funds,
                                        },
                                    ],
                                ],
                            }),
                        };
                    case 'systematicPrograms':
                        const systematicProgramsAndParties =
                            policy.systematicPrograms?.map(
                                (systematicProgram) => {
                                    // Party name, bank info, and address are mapped from
                                    // the partyId-to-party map on the PreparedPolicy
                                    const parties =
                                        systematicProgram.parties?.map(
                                            (partyData, i) => {
                                                const requiredPartyData =
                                                    fillInRequiredPartyDetails(
                                                        {
                                                            partyId:
                                                                partyData.partyId,
                                                            policy,
                                                            idFieldName:
                                                                'partyId',
                                                            allPartiesById,
                                                        },
                                                        t
                                                    );

                                                if (!requiredPartyData) {
                                                    return undefined;
                                                }

                                                const partyBankAndAddress =
                                                    fillInBankAndAddressInfo(
                                                        {
                                                            partyId:
                                                                partyData.partyId,
                                                            allPartiesById,
                                                        },
                                                        t
                                                    );

                                                const completePartyData = {
                                                    ...requiredPartyData,
                                                    ...partyBankAndAddress,
                                                    percentage:
                                                        partyData.percentage,
                                                    paymentForm:
                                                        partyData.paymentForm,
                                                    ...(partyData.partyRole && {
                                                        [tags]: [
                                                            formatAsDataValue(
                                                                partyData.partyRole,
                                                                t
                                                            ),
                                                        ],
                                                    }),
                                                };

                                                return completePartyData;
                                            }
                                        );

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
                                [
                                    currentKey,
                                    systematicProgramsAndParties ?? currentVal,
                                ],
                            ],
                        };
                    case 'riders':
                        const ridersAndParticipants = policy.riders?.map(
                            (rider) => {
                                // Party name is mapped from the partyId-to-party map
                                // on the PreparedPolicy
                                const parties = rider.riderParticipants?.map(
                                    (partyData, i) => {
                                        const requiredPartyData =
                                            fillInRequiredPartyDetails(
                                                {
                                                    partyId: partyData.partyId,
                                                    policy,
                                                    idFieldName: 'coveredParty',
                                                    allPartiesById,
                                                },
                                                t
                                            );

                                        if (!requiredPartyData) {
                                            return undefined;
                                        }

                                        const completePartyData = {
                                            ...requiredPartyData,
                                            partyAgeAtIssue:
                                                partyData.partyAgeAtIssue,
                                        };

                                        return completePartyData;
                                    }
                                );

                                return {
                                    ...rider,
                                    ...(parties && { riderParties: parties }),
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
                    case 'loanValues':
                        // Loan segments are split from the Allocation section
                        const loanSegments = policy.allocation?.loanSegments
                            ? convertListToMap<LoanSegment>(
                                  {
                                      subSectionList:
                                          policy.allocation?.loanSegments,
                                      subSectionTitleField,
                                      fallbackTitle: sectionTitle,
                                  },
                                  t
                              )
                            : undefined;
                        return {
                            ...acc,
                            policySections: [
                                ...acc.policySections,
                                [
                                    String(t('policy.allFields.loans')),
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

            // Oetherwise, the value is a primitive, so add it to the policy basics
            const shouldShowBasicField =
                currentVal != null && !excludeFields.has(currentKey);
            return {
                ...acc,
                ...(shouldShowBasicField && {
                    policyBasics: [
                        ...acc.policyBasics,
                        [currentKey, currentVal],
                    ],
                }),
            };
        },
        {
            policyBasics: [],
            policySections: [],
        }
    );

    // Fill in aggregated sections
    const nonNullMatchEntries = Object.entries(
        policy.allocation?.matchSegment ?? {}
    ).filter(([, data]) => data != null);
    if (nonNullMatchEntries.length) {
        basicsAndSections.policySections.push([
            String(t('policy.allFields.match')),
            Object.fromEntries(nonNullMatchEntries),
        ]);
    }

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
                            formatAsDataValue(currentPartyRole.partyRole, t),
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
        ?.map((party, i) => {
            const requiredPartyData = fillInRequiredPartyDetails(
                {
                    partyId: party.partyId,
                    policy,
                    idFieldName: 'partyName',
                    allPartiesById,
                },
                t
            );

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
                ...(partyTags && { [tags]: partyTags }),
            };

            return partyDetails;
        })
        .filter((p) => p != null);

    if (people) {
        basicsAndSections.policySections.push([
            String(t('policy.allFields.people')),
            people,
        ]);
    }
    return basicsAndSections;
};

const fillInRequiredPartyDetails = (
    {
        partyId,
        allPartiesById,
        policy,
        idFieldName,
    }: {
        partyId?: string;
        allPartiesById?: Record<string, Party>;
        policy: Policy;
        idFieldName: string;
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
    const partyName =
        `${partyObj.firstName ?? ''} ${partyObj.lastName ?? ''}`.trim() ||
        partyObj.fullName;

    if (!partyName) {
        return undefined;
    }

    //TODO: move out of this function
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
              formatAsDataValue(firstBank.accountType ?? null, t),
              'ending in',
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
 * Given a policy section, returns a {@link PreparedPolicySection} object
 * containing an array of field/data tuples and/or an array of subsections.
 *
 * If the section data is an array, each item in the array is treated as a
 * subsection, nested under "subSections". The title of each subsection will
 * map from a defined field *within* that subsection using the
 * {@link sectionTypeToSubSectionTitleFields} mapping.
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
export const toFieldsAndSubsections = (
    [sectionName, sectionData]: PolicySection,
    lineOfBusiness: LineOfBusiness,
    t: TFunction
): PreparedPolicySection => {
    // If sectionData is an array, treat each item as a subsection.
    // The title of each subsection will map from a defined field *within* that subsection
    if (sectionData instanceof Array) {
        sectionData;
        const subSectionTitleField =
            sectionTypeToSubSectionTitleFields[sectionName];
        const subSections = sectionData.map((subSection) => {
            const subSectionLabel =
                subSection[label] ??
                formatAsDataValue(subSection[subSectionTitleField], t);
            const subSectionLink = subSection[link];
            const subSectionLinkedField = subSection[linkedField];
            const subSectionTags = subSection[tags];
            const subSectionEntries = removeExcludedAndEmptyFields(
                Object.entries(subSection),
                [subSectionTitleField]
            );

            return [
                subSectionLabel,
                subSectionEntries,
                {
                    [tags]: subSectionTags,
                    [link]: subSectionLink,
                    [linkedField]: subSectionLinkedField,
                },
            ];
        });
        return {
            subSections: subSections as SubSection[], // FIXME
        };
    } else {
        const { fields, subSections } = removeExcludedAndEmptyFields(
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

                const subSectionData = removeExcludedAndEmptyFields(
                    Object.entries(fieldData)
                );

                // Only show non-empty subsections
                if (subSectionData.length) {
                    return {
                        fields: acc.fields, // keep fields untouched
                        subSections: [
                            ...(acc.subSections ?? []),
                            [
                                formatAsSectionLabel(
                                    String(fieldName),
                                    lineOfBusiness,
                                    t
                                ),
                                subSectionData,

                                // Add metadata for tags and linked field (1 per section)
                                {
                                    [tags]: fieldTags,
                                    [link]: fieldLink,
                                    [linkedField]: fieldLinkedField,
                                },
                            ],
                        ],
                    };
                }
                return acc;
            }

            // Otherwise, the value is meant to be displayed, so just append the key-value pair
            return {
                fields: removeExcludedAndEmptyFields([
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

/**
 * Given a list of subsections, creates a map where the keys are human-readable
 * titles derived from each subsection, and the values are the subsections
 * themselves.
 *
 * If the subsection does not contain a value for the given
 * `subSectionTitleField`, it will use the first value in the subsection as the
 * title instead. If the subsection is empty, it will use the given
 * `fallbackTitle` and the index of the subsection in the list (starting from 1).
 *
 * @param {T[]} subSectionList The list of subsections to convert
 * @param {string} subSectionTitleField The field name to use as the title for
 * each subsection
 * @param {string} fallbackTitle The title to use if the subsection does not
 * contain a value for `subSectionTitleField`
 * @returns {Record<DataKey, T>} A map where the keys are titles and the values
 * are the subsections
 *
 * TODO: this could actually be useful as a util
 */
const convertListToMap = <T extends DataRecord>(
    {
        subSectionList,
        subSectionTitleField,
        fallbackTitle,
    }: {
        subSectionList: T[];
        subSectionTitleField: string;
        fallbackTitle: string;
    },
    t: TFunction
) => {
    const subSectionMap = subSectionList?.reduce<Record<DataKey, T>>(
        (acc, currentSubSection, i) => {
            // Grab the first value to represent the title of the segment

            const subSectionTitle = formatAsDataValue(
                currentSubSection[subSectionTitleField] ??
                    Object.values(currentSubSection)[0] ??
                    `${fallbackTitle} ${i + 1}`,
                t
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
 * Given an array of key-value pairs, filters out any empty values and keys that
 * are excluded from display.
 *
 * @param tuples The array of key-value pairs to filter
 * @param additionalFieldsToExclude An optional array of additional fields to
 *      exclude from display
 * @returns The filtered array of key-value pairs
 */
const removeExcludedAndEmptyFields = (
    tuples: DataTuple[],
    additionalFieldsToExclude?: DataKey[]
) => {
    return tuples.filter(
        ([key, data]) =>
            data != null &&
            !excludeFields.has(key) &&
            !(
                additionalFieldsToExclude &&
                new Set(additionalFieldsToExclude).has(key)
            )
    );
};

/**
 * Given a section label, a line of business, and optionally a product type,
 * determines whether the section should be shown.
 *
 * @param sectionLabel The section label to check
 * @param lineOfBusiness The line of business for the policy
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
