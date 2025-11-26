import { TFunction } from 'next-i18next';

import { typedEntries } from '@deps/utils/objects';
import {
    Policy,
    LineOfBusiness,
    LoanSegment,
    Fund,
    FundAllocation,
    Party,
    ProductType,
    Transaction,
} from '@zinnia/api-types/types/sor';

import {
    formatDataField,
    formatAsSectionLabel,
    removeExcludedAndEmptyFields,
    formatAsDataValue,
    combinedTransform,
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
    DataSection,
    FormatterType,
    FieldType,
    DataNode,
    Primitive,
} from './types';

// pipe needs to take the first arg as Policy/Transaction -> DataNode[]
// and the rest as DataNode[] -> DataNode[]
export const convertToDataNode =
    <T>(
        initialTransformFn: (data: T, t?: TFunction) => DataNode[],
        ...fns: Array<(data: DataNode[], t?: TFunction) => DataNode[]>
    ) =>
    (initialValue: T) => {
        const initialTransformedData = initialTransformFn(initialValue);
        const v = fns.reduce((acc, fn) => {
            const ret = fn(acc);
            return ret;
        }, initialTransformedData);
        return v;
    };

const isPrimitive = (v: any): v is Primitive => {
    return (
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
    );
};

const isUnknownArray = (v: unknown): v is unknown[] => Array.isArray(v);

const isNonNullishObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v != null;

const isNonEmptyString = (v: unknown): v is string =>
    typeof v === 'string' && v !== ''; // TODO: more specific TS type

export function convertNode(
    obj: unknown,
    t: TFunction,
    overrides?: Record<string, string>
): DataNode[] {
    if (!isNonNullishObject(obj)) return [];

    return typedEntries(obj)
        .map(([key, value]) => convertTuple(key, value, t, overrides))
        .filter((n): n is DataNode => n != null);
}
function convertTuple(
    key: string,
    value: unknown,
    t: TFunction,
    overrides?: Record<string, string>
): DataNode | undefined {
    const label = overrides?.[key] ?? key;

    // Skip nullish values
    if (value === null || value === '') return;

    // Primitive → Field
    if (isPrimitive(value)) {
        return {
            type: FieldType.field,
            label: label,
            value: String(value),
        };
    }

    // Array → Section -> subsection-field-to-title.ts
    if (isUnknownArray(value)) {
        const sectionLabelFieldName = sectionTypeToSubSectionTitleFields[key];
        if (sectionLabelFieldName) {
            const sections: DataSection[] = value
                .map((item): DataSection | undefined => {
                    //object within each array item
                    if (!isNonNullishObject(item)) return;
                    const sectionLabel = item[sectionLabelFieldName];
                    if (!isNonEmptyString(sectionLabel)) return; // TODO: maybe skip, maybe provide default label?
                    // TODO: filter out fields that are not visible, including the title field
                    const fields: DataNode[] = convertNode(item, t, overrides);

                    return {
                        type: FieldType.section,
                        label: t(sectionLabel) ?? sectionLabel,
                        children: fields, // TODO: recurse?
                    };
                })
                .filter((n) => n != null);

            return {
                type: FieldType.section,
                label: t(key) ?? key,
                children: sections,
            };
        } else {
            // value is list of groups
            const groups: DataNode[][] = value.map((item) =>
                convertNode(item, t, overrides)
            );
            if (groups.length === 0) return;

            return {
                type: FieldType.section,
                label: t(key) ?? key,
                children: [
                    // In some instances the array will also contain fields and sections
                    {
                        type: FieldType.group,
                        children: groups,
                    },
                ],
            };
        }
    }

    // Object → Section
    if (typeof value === 'object' && !Array.isArray(value)) {
        const children = convertNode(value, t, overrides);

        if (children.length === 0) return;

        return {
            type: FieldType.section,
            label,
            children,
        };
    }

    return;
}

export const transformObject = (
    node: DataNode,
    transform: (node: DataNode) => DataNode | null
): DataNode | null => {
    const transformed = transform(node);
    // If the transform says "remove this node", we stop here.
    if (transformed === null) return null;

    switch (node.type) {
        case FieldType.field:
            return transformed;
        case FieldType.section: {
            const newChildren = transformed.children
                .map((child) => transformObject(child, transform))
                .filter((n): n is DataNode => n !== null);

            return transform({
                ...transformed,
                children: newChildren,
            });
        }
        case FieldType.group: {
            const newGroups = transformed.children.map((group) =>
                group
                    .map((child) => transformObject(child, transform))
                    .filter((n): n is DataNode => n !== null)
            );
            return transform({
                ...transformed,
                children: newGroups,
            });
        }
        default:
            return transformed;
    }
};

export const groupBasics = (data: DataNode[], t: TFunction): DataNode[] => {
    const filterByField = data.filter((node) => node.type === FieldType.field);
    const filterBySectionOrList = data.filter(
        (node) => node.type !== FieldType.field
    );

    return [
        {
            type: FieldType.section,
            label: t('basics'),
            children: filterByField,
        },
        ...filterBySectionOrList,
    ];
};

export function searchNodes(nodes: DataNode[], search: string): DataNode[] {
    // should only filter on fields, still highlight section labels
    // if there are no fields in section | group, remove the section / group
    const lower = search.toLowerCase();

    const filterNode = (node: DataNode): DataNode | null => {
        if (node.type === FieldType.field) {
            const match =
                node.label.toLowerCase().includes(lower) ||
                node.value.toLowerCase().includes(lower);
            return match ? node : null;
        }

        if (node.type === FieldType.section) {
            // Recursively filter children
            const filteredChildren = node.children
                .map(filterNode)
                .filter((n): n is DataNode => n !== null);

            if (filteredChildren.length > 0) {
                return {
                    ...node,
                    children: filteredChildren,
                };
            }
            return null;
        }

        if (node.type === FieldType.group) {
            const filteredGroups = node.children
                .map((group) =>
                    group
                        .map(filterNode)
                        .filter((n): n is DataNode => n !== null)
                )
                .filter((g) => g.length > 0);

            if (filteredGroups.length > 0) {
                return {
                    ...node,
                    children: filteredGroups,
                };
            }
            return null;
        }
        return null;
    };

    // Apply filtering to the top-level array
    return nodes.map(filterNode).filter((n): n is DataNode => n !== null);
}

export const excludeNodesByLabel = (data: DataNode[], t: TFunction) => {
    return data
        .map((node: DataNode) =>
            transformObject(
                node,
                combinedTransform({
                    t,
                    exclude: ['timestamp', 'id', 'transactionAmounts'],
                })
            )
        )
        .filter((n): n is DataNode => n !== null);
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
        partyObj.fullName ||
        partyObj.agentExternalId;

    if (!partyName) {
        return undefined;
    }

    const planCode = policy.product?.planCode;
    const policyNumber = policy.policyNumber;
    const partyLink = `/policies/${planCode}/${policyNumber}/people/${partyObj.partyId}`;

    const additionalPartyData = {
        partyId, // TODO: review: I don't think we want to show partyId here
        // but it's unintentionally controlling visibility of People

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
export const toFieldsAndSubsections = ({
    tuple: [sectionName, sectionData],
    lineOfBusiness,
    t,
    type,
    searchValue,
}: {
    tuple: [string, unknown[] | Record<string, unknown>];
    lineOfBusiness: LineOfBusiness;
    t: TFunction;
    type: FormatterType;
    searchValue?: string;
}): {
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
                const subSectionLabel =
                    (subSection as MetaData)[label] ??
                    (subSection as Record<string, unknown>)[
                        subSectionTitleField
                    ];
                const subSectionLink = (subSection as MetaData)[link];
                const subSectionLinkedField = (subSection as MetaData)[
                    linkedField
                ];
                const subSectionTags = (subSection as MetaData)[tags];
                const subSectionEntries = removeExcludedAndEmptyFields({
                    tuples: Object.entries(subSection),
                    lineOfBusiness,
                    t,
                    type,
                    fieldLink: subSectionLink,
                    linkedField: subSectionLinkedField,
                    searchValue,
                    additionalFieldsToExclude: [subSectionTitleField],
                });

                if (!subSectionEntries?.length) {
                    return null;
                }

                const subSectionTuple = [
                    subSectionLabel
                        ? formatAsDataValue({
                              fieldData: String(subSectionLabel),
                              t,
                          })
                        : undefined,
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
                                {
                                    tuples: fieldEntry as NestedData,
                                    lineOfBusiness,
                                    t,
                                    type,
                                    fieldLink: undefined,
                                    linkedField: undefined,
                                    searchValue,
                                }
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
                    (fieldData as MetaData)[label] = formatAsSectionLabel({
                        label: subSectionName,
                        lineOfBusiness,
                        t,
                    });
                }

                // Otherwise, the value is meant to be displayed, so just append the key-value pair
                return formatDataField({
                    tuple: [subSectionName, fieldData] as NestedData,
                    lineOfBusiness,
                    t,
                    type,
                    searchValue,
                });
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
const shouldShowSection = ({
    sectionLabel,
    lineOfBusiness,
    planCode,
    productType,
}: {
    sectionLabel: string;
    lineOfBusiness: LineOfBusiness;
    planCode?: string;
    productType?: ProductType;
}): boolean | undefined => {
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
function parsePeople({
    roleMap,
    policy,
    allPartiesById,
    t,
}: {
    roleMap?: {
        partyRole?: string;
        partyId?: string;
    }[];
    policy: Policy;
    allPartiesById: Record<string, Party> | undefined;
    t: TFunction;
}) {
    // Make a map of party roles to reference as tags for the People section
    const partyRoleMap = roleMap?.reduce<Record<string, string[]>>(
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
                    [tags]: partyTags.map((tag) =>
                        formatAsDataValue({ fieldData: tag, t })
                    ),
                }),
            };

            return partyDetails;
        })
        .filter((p) => {
            if (p) {
                return p !== null && partyRoleMap?.[p?.partyId];
            }
        });
    return people;
}

/**
 * Transforms the transaction's tax information into a nested data tuple.
 * Combines the transaction's tax basis, tax withholding instructions and tax withholding amounts into a single object.
 * @returns A nested data tuple containing the transaction's tax information
 */
function parseTransactionTaxes({
    transaction,
    policy,
    allPartiesById,
    t,
}: {
    transaction: Transaction;
    policy: Policy;
    allPartiesById: Record<string, Party> | undefined;
    t: TFunction;
}): Record<string, unknown> {
    const taxWithholdingInstructionsMap =
        transaction.taxWithholdingInstructions?.reduce(
            (acc, withholdingInstruction) => {
                const additionalPartyData = fillInRequiredPartyDetails({
                    partyId: withholdingInstruction.partyId,
                    allPartiesById,
                    policy,
                    idFieldName: 'partyName',
                });

                return {
                    ...acc,
                    [`${t('withholdingInstructions')} – ${
                        withholdingInstruction.taxWithholdingType
                    } – ${withholdingInstruction.taxJurisdiction}`]: {
                        ...additionalPartyData,
                        ...withholdingInstruction,
                        ...(withholdingInstruction.partyRole && {
                            [tags]: [
                                formatAsDataValue({
                                    fieldData: withholdingInstruction.partyRole,
                                    t,
                                }),
                            ],
                        }),
                    },
                };
            },
            {}
        );

    const taxWithheldAmountsMap = transaction.taxWithheldAmounts?.reduce(
        (acc, withholdingAmounts) => {
            const additionalPartyData = fillInRequiredPartyDetails({
                partyId: withholdingAmounts.partyId,
                allPartiesById,
                policy,
                idFieldName: 'partyName',
            });

            return {
                ...acc,
                [`${t('withholdingAmounts')} - ${t(
                    withholdingAmounts.taxWithholdingType ?? ''
                )}`]: {
                    ...additionalPartyData,
                    ...withholdingAmounts,
                    ...(withholdingAmounts.partyRole && {
                        [tags]: [
                            formatAsDataValue({
                                fieldData: withholdingAmounts.partyRole,
                                t,
                            }),
                        ],
                    }),
                },
            };
        }
    );
    return {
        ...transaction.taxBasis,
        ...taxWithholdingInstructionsMap,
        ...taxWithheldAmountsMap,
    };
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
function parseLoanValues({
    policy,
    subSectionTitleField,
    sectionTitle,
    acc,
    currentVal,
}: {
    policy: Policy;
    subSectionTitleField: string;
    sectionTitle: string;
    t: TFunction;
    acc: ToSections;
    currentVal: object;
}) {
    const loanSegments = policy.allocation?.loanSegments
        ? convertListToMap<LoanSegment>({
              subSectionList: policy.allocation?.loanSegments,
              subSectionTitleField,
              fallbackTitle: sectionTitle,
          })
        : undefined;
    return {
        ...acc,
        sections: [
            ...acc.sections,
            [
                'loans',
                {
                    ...currentVal,
                    ...loanSegments,
                },
            ] as DataSection,
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
function parseRiders({
    policy,
    allPartiesById,
    acc,
    currentKey,
    currentVal,
}: {
    policy: Policy;
    allPartiesById: Record<string, Party> | undefined;
    t: TFunction;
    acc: ToSections;
    currentKey: string;
    currentVal: object;
}) {
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
            ...parties,
        };
    });

    return {
        ...acc,
        sections: [
            ...acc.sections,
            [currentKey, ridersAndParticipants ?? currentVal] as DataSection,
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
function parseSystematicPrograms({
    policy,
    allPartiesById,
    t,
    acc,
    currentKey,
    currentVal,
}: {
    policy: Policy;
    allPartiesById: Record<string, Party> | undefined;
    t: TFunction;
    acc: ToSections;
    currentKey: string;
    currentVal: object;
}) {
    const systematicProgramsAndParties = policy.systematicPrograms?.map(
        (systematicProgram) => {
            // Party name, bank info, and address are mapped from
            // the partyId-to-party map on the PreparedPolicy
            const parties = systematicProgram.parties?.map((partyData) => {
                const requiredPartyData = fillInRequiredPartyDetails({
                    partyId: partyData.partyId,
                    policy,
                    idFieldName: 'partyName',
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
                        [tags]: [
                            formatAsDataValue({
                                fieldData: partyData.partyRole,
                                t,
                            }),
                        ],
                    }),
                };

                return completePartyData;
            });

            return {
                ...systematicProgram,
                ...parties,
            };
        }
    );
    return {
        ...acc,
        sections: [
            ...acc.sections,
            [
                currentKey,
                systematicProgramsAndParties ?? currentVal,
            ] as DataSection,
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
function parseAllocation({
    policy,
    subSectionTitleField,
    sectionTitle,
    acc,
    currentVal,
}: {
    policy: Policy;
    subSectionTitleField: string;
    sectionTitle: string;
    acc: ToSections;
    currentVal: Policy['allocation'];
}) {
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
            sections: [
                ...acc.sections,
                [
                    'combinedFunds',
                    {
                        ...currentVal,
                        ...funds,
                    },
                ] as DataSection,
            ],
        }),
    };
}
