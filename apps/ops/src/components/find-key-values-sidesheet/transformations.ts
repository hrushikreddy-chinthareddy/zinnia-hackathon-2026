import { Policy } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { typedEntries } from '@deps/utils/objects';

import {
    combinedTransform,
    formatPartyLink,
    formatSectionLabel,
    formatToolTip,
} from './formatters';
import { excludeFields } from './translations/exclude-fields';
import { sectionTypeToSubSectionTitleFields } from './translations/subsection-field-to-title';
import {
    FieldType,
    DataNode,
    Primitive,
    DataField,
    DataSection,
    DataGroup,
    DocumentFormat,
    DocumentFormatType,
} from './types';

// pipe needs to take the first arg as Policy/Transaction -> DataNode[]
// and the rest as DataNode[] -> DataNode[]
export const applyTransformationsToNodes =
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

export function convertNode(obj: unknown, t: TFunction): DataNode[] {
    if (!isNonNullishObject(obj)) return [];

    return typedEntries(obj)
        .map(([key, value]) => convertTuple(key, value, t))
        .filter((n): n is DataNode => n != null);
}
function convertTuple(
    key: string,
    value: unknown,
    t: TFunction
): DataNode | undefined {
    // Skip nullish values
    if (value === null || value === '') return;

    // Primitive → Field
    if (isPrimitive(value)) {
        return {
            type: FieldType.field,
            label: key,
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
                    const fields: DataNode[] = convertNode(item, t);

                    return {
                        type: FieldType.section,
                        label: sectionLabel,
                        children: fields, // TODO: recurse?
                    };
                })
                .filter((n) => n != null);

            return {
                type: FieldType.section,
                label: key,
                children: sections,
            };
        } else {
            // value is list of groups
            const groups: DataNode[][] = value.map((item) =>
                convertNode(item, t)
            );
            if (groups.length === 0) return;

            return {
                type: FieldType.section,
                label: key,
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
        const children = convertNode(value, t);

        if (children.length === 0) return;

        return {
            type: FieldType.section,
            label: key,
            children,
        };
    }

    return;
}

export const transformObject = (
    node: DataNode,
    transform: (node: DataNode) => DataNode | null
): DataNode | null => {
    switch (node.type) {
        case FieldType.field:
            return transform(node);
        case FieldType.section: {
            const newChildren = node.children
                .map((child) => transformObject(child, transform))
                .filter((n): n is DataNode => n !== null);

            return transform({
                ...node,
                children: newChildren,
            });
        }
        case FieldType.group: {
            const newGroups = node.children.map((group) =>
                group
                    .map((child) => transformObject(child, transform))
                    .filter((n): n is DataNode => n !== null)
            );
            return transform({
                ...node,
                children: newGroups,
            });
        }
        default:
            return transform(node);
    }
};

export const groupBasics = (
    data: DataNode[],
    t: TFunction,
    type: DocumentFormatType
): DataNode[] => {
    const filterByField = data.filter((node) => node.type === FieldType.field);
    const filterBySectionOrList = data.filter(
        (node) => node.type !== FieldType.field
    );
    const label =
        type === DocumentFormat.transaction
            ? 'transactionDetails'
            : 'policyBasics';

    return [
        {
            type: FieldType.section,
            label,
            children: filterByField,
        },
        ...filterBySectionOrList,
    ];
};

export const getAllParties = ({
    nodes,
    t,
    planCode,
    policyNumber,
}: {
    nodes: DataNode[];
    t: TFunction;
    planCode: string;
    policyNumber: string;
}): {
    allParties: DataSection[];
    allPartiesById: Record<string, DataSection | undefined>;
} => {
    const partyRoles: DataSection[] =
        nodes
            .filter(isDataSection)
            .find((node) => node.label === 'partyRoles')
            ?.children.filter(isDataSection) ?? [];

    const roleMap: Record<string, string[]> = partyRoles.reduce<
        Record<string, string[]>
    >((acc, role) => {
        const partyRole = findValueInNode({
            node: role,
            key: 'partyRole',
        });

        if (!partyRole) return acc;

        const currentPartyIdRoles = acc[role.label] || [];

        const combinedPartyRoles = {
            [role.label]: [...currentPartyIdRoles, partyRole],
        };

        return {
            ...acc,
            ...combinedPartyRoles,
        };
    }, {});

    const allParties =
        nodes
            .filter(isDataSection)
            // Parties node should always be present
            .find((partiesNode) => partiesNode.label === 'parties')
            // Children should always be DataSection's
            ?.children.filter(isDataSection)
            .map((partyNode): DataSection => {
                const partyId = findValueInNode({
                    node: partyNode,
                    key: 'partyId',
                });

                if (!partyId) return partyNode;

                const partyLink = `/policies/${planCode}/${policyNumber}/people/${partyId}`;

                const partyFirstName = findValueInNode({
                    node: partyNode,
                    key: 'firstName',
                });
                const partyLastName = findValueInNode({
                    node: partyNode,
                    key: 'lastName',
                });

                const partyFullName = findValueInNode({
                    node: partyNode,
                    key: 'fullName',
                });

                const partyAgentExternalId = findValueInNode({
                    node: partyNode,
                    key: 'agentExternalId',
                });

                const partyName =
                    `${partyFirstName ?? ''} ${partyLastName ?? ''}`.trim() ||
                    partyFullName ||
                    partyAgentExternalId ||
                    partyId;

                const ssn = findValueInNode({
                    node: partyNode,
                    key: 'identifications.SSN.identificationValue',
                });

                const dob = findValueInNode({
                    node: partyNode,
                    key: 'dateOfBirth',
                });

                // Bank info
                const firstBank = findInNode({
                    node: partyNode,
                    key: 'bankDetails.0',
                });
                const bankBranchName = findValueInNode({
                    node: firstBank,
                    key: 'branchName',
                });
                const bankAccountType = findValueInNode({
                    node: firstBank,
                    key: 'accountType',
                });
                const bankAccountNumber = findValueInNode({
                    node: firstBank,
                    key: 'accountNumber',
                });

                const bankInfo = firstBank
                    ? [
                          bankBranchName ?? '',
                          bankAccountType ?? '',
                          t('policy.commonPhrases.endingIn'),
                          bankAccountNumber?.slice(-4) ?? '****',
                      ].join(' ')
                    : undefined;

                // Address info
                const firstAddress = findInNode({
                    node: partyNode,
                    key: 'addresses.0',
                });

                const addressLine1 = findValueInNode({
                    node: firstAddress,
                    key: 'addressLine1',
                });

                const city = findValueInNode({
                    node: firstAddress,
                    key: 'city',
                });

                const state = findValueInNode({
                    node: firstAddress,
                    key: 'state',
                });

                const zipCode = findValueInNode({
                    node: firstAddress,
                    key: 'zipCode',
                });

                const addressInfo = firstAddress
                    ? [
                          addressLine1 ?? '',
                          city ?? '',
                          `${state ?? ''} ${zipCode ?? ''}`,
                      ]
                          .join(', ')
                          .trim()
                    : undefined;

                const personSection: DataSection = {
                    label: partyId,
                    type: FieldType.section,

                    // Selectively populated below
                    children: [
                        {
                            type: FieldType.field,
                            label: 'partyName',
                            value: partyName,
                            link: partyLink,
                        },
                    ],

                    // This is the default, can be overridden by section-specific roles
                    tags: roleMap[partyId],
                };

                if (ssn) {
                    personSection.children.push({
                        type: FieldType.field,
                        label: 'ssn',
                        value: ssn,
                    });
                }

                if (dob) {
                    personSection.children.push({
                        type: FieldType.field,
                        label: 'dob',
                        value: dob,
                    });
                }
                if (bankInfo) {
                    personSection.children.push({
                        type: FieldType.field,
                        label: 'bankInfo',
                        value: bankInfo,
                    });
                }
                if (addressInfo) {
                    personSection.children.push({
                        type: FieldType.field,
                        label: 'addressInfo',
                        value: addressInfo,
                    });
                }

                return personSection;
            }) ?? [];

    // Key each section to partyId
    const allPartiesById =
        allParties.reduce(
            (acc: Record<string, DataSection | undefined>, party) => {
                if (party.type !== FieldType.section) return acc;
                return {
                    ...acc,
                    [party.label]: party,
                };
            },
            {}
        ) ?? {};

    return {
        allParties,
        allPartiesById,
    };
};

export const groupSectionsForPolicy = (
    nodes: DataNode[],
    t: TFunction,
    documentType: DocumentFormatType,
    planCode: string,
    policyNumber: string
): DataNode[] => {
    const { allParties, allPartiesById } = getAllParties({
        nodes,
        t,
        planCode,
        policyNumber,
    });

    // Aggregated sections will be filled in later
    const loans: DataSection = {
        type: FieldType.section,
        label: 'loans',
        children: [],
    };

    // Additional sections with aggregated data
    const people: DataSection = {
        type: FieldType.section,
        label: 'people',
        children: allParties.map((party) => {
            return {
                type: FieldType.section,
                // Remap label to partyName for rendering
                label:
                    findValueInNode({
                        node: party,
                        key: 'partyName',
                    }) ?? party.label,
                children: party.children.filter(
                    (child) =>
                        child.type === FieldType.field &&
                        ['partyName', 'dob', 'ssn'].includes(child.label)
                ),
                tags: party.tags,
            };
        }),
    };

    const combinedSections: DataNode[] = nodes.map((node) => {
        if (node.type !== FieldType.section) return node;

        // Combine sections
        switch (node.label) {
            case 'allocation': {
                // Extract loan segments and push to loans
                const loans = node.children
                    .filter(isDataSection)
                    .find((node) => node.label === 'loansSegments');

                if (loans) {
                    loans.children.push(...node.children);
                }

                return parseAllocation({
                    allocation: node,
                });
            }

            case 'systematicPrograms':
                return parseSystematicPrograms({
                    systematicPrograms: node,
                    allPartiesById,
                });

            case 'riders':
                return parseRiders({
                    riders: node,
                    allPartiesById,
                });

            case 'loanValues':
                // Extract loan values and push to loans
                loans.children.push(...node.children);
                return node;
            default:
                return node;
        }
    });

    console.log('......combinedSections', combinedSections);
    return [...combinedSections, loans, people];
    //const subSectionTitleField =
    //    sectionTypeToSubSectionTitleFields[sectionTitle];
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

    return nodes.map(filterNode).filter((n): n is DataNode => n !== null);
}

export const formatSectionLabels = (
    data: DataNode[],
    t: TFunction,
    nomenclature?: string
) => {
    return data
        .map((node: DataNode) =>
            transformObject(
                node,
                formatSectionLabel({
                    t,
                    nomenclature,
                })
            )
        )
        .filter((n): n is DataNode => n !== null);
};

export const formatPartyIdLink = (
    data: DataNode[],
    planCode: string,
    policyNumber: string,
    policy: Policy
) => {
    return data
        .map((node: DataNode) =>
            transformObject(
                node,
                formatPartyLink({ planCode, policyNumber, policy })
            )
        )
        .filter((n): n is DataNode => n !== null);
};

export const excludeNodesByLabel = (
    data: DataNode[],
    t: TFunction,
    policyNomenclature?: string
) => {
    return data
        .map((node: DataNode) =>
            transformObject(
                node,
                combinedTransform({
                    t,
                    exclude: Array.from(excludeFields),
                    policyNomenclature,
                })
            )
        )
        .filter((n): n is DataNode => n !== null);
};

export const addToolTips = (
    data: DataNode[],
    t: TFunction,
    type?: DocumentFormatType
) => {
    const nomenclature =
        type === DocumentFormat.transaction ? 'transaction' : 'policy';
    return data
        .map((node: DataNode) =>
            transformObject(
                node,
                formatToolTip({
                    t,
                    nomenclature,
                })
            )
        )
        .filter((n): n is DataNode => n !== null);
};

/**
 * Transforms the transaction's tax information into a nested data tuple.
 * Combines the transaction's tax basis, tax withholding instructions and tax withholding amounts into a single object.
 * @returns A nested data tuple containing the transaction's tax information
 */
// function parseTransactionTaxes({
//     transaction,
//     policy,
//     allPartiesById,
//     t,
// }: {
//     transaction: Transaction;
//     policy: Policy;
//     allPartiesById: Record<string, Party> | undefined;
//     t: TFunction;
// }): Record<string, unknown> {
//     const taxWithholdingInstructionsMap =
//         transaction.taxWithholdingInstructions?.reduce(
//             (acc, withholdingInstruction) => {
//                 const additionalPartyData = fillInRequiredPartyDetails({
//                     partyId: withholdingInstruction.partyId,
//                     allPartiesById,
//                     policy,
//                     idFieldName: 'partyName',
//                 });

//                 return {
//                     ...acc,
//                     [`${t('withholdingInstructions')} – ${
//                         withholdingInstruction.taxWithholdingType
//                     } – ${withholdingInstruction.taxJurisdiction}`]: {
//                         ...additionalPartyData,
//                         ...withholdingInstruction,
//                         ...(withholdingInstruction.partyRole && {
//                             [tags]: [
//                                 formatAsDataValue({
//                                     fieldData: withholdingInstruction.partyRole,
//                                     t,
//                                 }),
//                             ],
//                         }),
//                     },
//                 };
//             },
//             {}
//         );

//     const taxWithheldAmountsMap = transaction.taxWithheldAmounts?.reduce(
//         (acc, withholdingAmounts) => {
//             const additionalPartyData = fillInRequiredPartyDetails({
//                 partyId: withholdingAmounts.partyId,
//                 allPartiesById,
//                 policy,
//                 idFieldName: 'partyName',
//             });

//             return {
//                 ...acc,
//                 [`${t('withholdingAmounts')} - ${t(
//                     withholdingAmounts.taxWithholdingType ?? ''
//                 )}`]: {
//                     ...additionalPartyData,
//                     ...withholdingAmounts,
//                     ...(withholdingAmounts.partyRole && {
//                         [tags]: [
//                             formatAsDataValue({
//                                 fieldData: withholdingAmounts.partyRole,
//                                 t,
//                             }),
//                         ],
//                     }),
//                 },
//             };
//         }
//     );
//     return {
//         ...transaction.taxBasis,
//         ...taxWithholdingInstructionsMap,
//         ...taxWithheldAmountsMap,
//     };
// }

function parseRiders({
    riders,
    allPartiesById,
}: {
    riders: DataSection;
    allPartiesById: Record<string, DataSection | undefined>;
}) {
    const ridersAndParties = riders.children.map((rider) => {
        if (rider.type !== FieldType.section) {
            return rider;
        }

        const partiesSection = rider.children
            .filter(isDataSection)
            .find((child) => child.label === 'riderParticipants');

        const parties: DataSection[] =
            partiesSection?.children
                .filter((party): party is DataSection => {
                    return party.type === FieldType.section;
                })
                .map((party) => {
                    // Before translations are applied party label is partyId
                    const partyId = party.label;
                    const partyReference = allPartiesById[partyId];
                    const partyNameField = findFieldInNode({
                        node: partyReference,
                        key: 'partyName',
                    });

                    const retainedFields = ['partyAgeAtIssue'];
                    const hydratedParty: DataSection = {
                        ...party,
                        label: partyNameField?.value ?? partyId,
                        children: [
                            {
                                type: FieldType.field,
                                label: 'coveredParty',
                                value: partyNameField?.value ?? partyId,
                                link: partyNameField?.link,
                            },
                            ...party.children
                                .filter(isDataField)
                                .filter((partyField) =>
                                    retainedFields.includes(partyField.label)
                                ),
                        ],
                    };

                    return hydratedParty;
                }) ?? [];

        const hydratedRider: DataSection = {
            ...rider,
            children: [...rider.children, ...parties],
        };

        return hydratedRider;
    });

    return {
        ...riders,
        children: ridersAndParties,
    };
}

function parseSystematicPrograms({
    systematicPrograms,
    allPartiesById,
}: {
    systematicPrograms: DataSection;
    allPartiesById: Record<string, DataSection | undefined>;
}): DataSection {
    const systematicProgramsAndParties = systematicPrograms.children.map(
        (systematicProgram) => {
            if (systematicProgram.type !== FieldType.section) {
                return systematicProgram;
            }
            // Party name, bank info, and address are mapped from
            // the partyId-to-party map on the PreparedPolicy
            const partiesSection = systematicProgram.children
                .filter(isDataSection)
                .find((child) => child.label === 'parties');

            const parties: DataSection[] =
                partiesSection?.children.filter(isDataSection).map((party) => {
                    const tag = findValueInNode({
                        node: party,
                        key: 'partyRole',
                    });
                    // Before translations are applied party label is partyId
                    const partyId = party.label;
                    const partyReference = allPartiesById[partyId];
                    const partyNameField = findFieldInNode({
                        node: partyReference,
                        key: 'partyName',
                    });

                    const retainedFields = ['paymentForm'];
                    const hydratedParty: DataSection = {
                        ...party,
                        label: partyNameField?.value ?? partyId,
                        children: [
                            {
                                type: FieldType.field,
                                label: 'partyName',
                                value: partyNameField?.value ?? partyId,
                                link: partyNameField?.link,
                            },
                            ...party.children
                                .filter(isDataField)
                                .filter((partyField) =>
                                    retainedFields.includes(partyField.label)
                                ),
                        ],
                        tags: tag ? [tag] : undefined,
                    };

                    const bankInfoField = findFieldInNode({
                        node: partyReference,
                        key: 'bankInfo',
                    });

                    const addressInfoField = findFieldInNode({
                        node: partyReference,
                        key: 'addressInfo',
                    });

                    if (bankInfoField) {
                        hydratedParty.children.push(bankInfoField);
                    }

                    if (addressInfoField) {
                        hydratedParty.children.push(addressInfoField);
                    }

                    return hydratedParty;
                }) ?? [];

            const hydratedSystematicProgram: DataSection = {
                ...systematicProgram,
                children: parties,
            };

            return hydratedSystematicProgram;
        }
    );

    return {
        ...systematicPrograms,
        children: systematicProgramsAndParties,
    };
}

function parseAllocation({
    allocation,
}: {
    allocation: DataSection;
}): DataSection {
    // Funds are mapped from the Allocation section, minus the loanSegments subsections
    // Combine fundAllocationsInvestments and funds into a flat map

    const fundsSectionNames = ['fundAllocationsInvestments', 'funds'];
    const combinedFunds = allocation.children
        .filter(isDataSection)
        .filter((child) => fundsSectionNames.includes(child.label))
        .reduce((acc: DataNode[], child) => [...acc, ...child.children], []);

    return {
        type: FieldType.section,
        label: 'combinedFunds',
        children: [
            ...allocation.children.filter(isDataField),
            ...combinedFunds,
        ],
    };
}

function isDataSection(node: DataNode): node is DataSection {
    return node.type === FieldType.section;
}

function isDataSectionOrField(node: DataNode): node is DataSection | DataField {
    return node.type === FieldType.section || node.type === FieldType.field;
}

function isDataField(node: DataNode): node is DataField {
    return node.type === FieldType.field;
}

function isDataGroup(node: DataNode): node is DataGroup {
    return node.type === FieldType.group;
}

function findInNode({
    node,
    key,
}: {
    node?: DataNode;
    key: string;
}): DataNode | undefined {
    if (node == null || (node.type === FieldType.field && node.label === key)) {
        return node;
    } else if (node.type === FieldType.section) {
        return findInNodes({
            nodes: node.children,
            key,
        });
    } else if (node.type === FieldType.group) {
        return findInGroup({
            nodes: node.children,
            key,
        });
    }
}

function findInGroup({
    nodes,
    key,
}: {
    nodes: DataNode[][];
    key: string;
}): DataNode | undefined {
    const pathFragments = key.split('.');
    const [firstFragment, ...rest] = pathFragments;

    // Case 1: numeric index into the group-of-groups
    if (!isNaN(Number(firstFragment))) {
        const index = Number(firstFragment);
        const firstNodeOrNodes = nodes[index];

        if (!firstNodeOrNodes) {
            return undefined;
        }

        if (rest.length) {
            return findInNodes({
                nodes: firstNodeOrNodes,
                key: rest.join('.'),
            });
        }

        //TODO: future provision, return list of nodes
    }

    // Case 2: non-numeric – search each inner array for the first match by label
    for (const innerNodes of nodes) {
        const candidate = findInNodes({
            nodes: innerNodes,
            key, // whole key, so findInNodes will handle rest of path
        });

        if (candidate !== undefined) {
            return candidate;
        }
    }
}

function findSectionInNodes({
    nodes,
    key,
}: {
    nodes: DataNode[];
    key: string;
}): DataSection | undefined {
    return findInNodes({
        nodes,
        key,
        predicate: isDataSection,
    }) as DataSection | undefined;
}

function findInNodes({
    nodes,
    key,
    predicate = isDataSectionOrField,
}: {
    nodes: DataNode[];
    key: string;
    predicate?:
        | typeof isDataSection
        | typeof isDataSectionOrField
        | typeof isDataField;
}): DataNode | undefined {
    const pathFragments = key.split('.');
    const [firstFragment, ...rest] = pathFragments;
    const firstNode = !isNaN(Number(firstFragment))
        ? nodes[Number(firstFragment)]
        : nodes
              .filter(predicate)
              .find((child) => child.label === firstFragment);

    if (rest.length) {
        if (firstNode) {
            return findInNode({ node: firstNode, key: rest.join('.') });
        }
    } else {
        return firstNode;
    }
}
function findFieldInNode({
    node,
    key,
}: {
    node?: DataNode;
    key: string;
}): DataField | undefined {
    const foundNode = findInNode({ node, key });
    if (foundNode && foundNode.type === FieldType.field) {
        return foundNode;
    }
}

function findValueInNode({
    node,
    key,
}: {
    node?: DataNode;
    key: string;
}): string | undefined {
    const foundNode = findInNode({ node, key });
    if (foundNode && foundNode.type === FieldType.field) {
        return foundNode.value;
    }
}
