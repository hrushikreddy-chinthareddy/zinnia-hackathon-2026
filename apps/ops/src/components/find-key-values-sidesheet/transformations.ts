import { TFunction } from 'next-i18next';

import {
    LineOfBusiness,
    Policy,
    ProductType,
} from '@zinnia/api-types/types/sor';

import { convertNode, transformObject } from './data-node-helpers/mutations';
import { isDataSection, isDataField } from './data-node-helpers/predicates';
import {
    findValueInNode,
    findInNode,
    findFieldInNode,
} from './data-node-helpers/traversal';
import {
    combinedTransform,
    formatAsDataValue,
    formatPartyLink,
    formatSectionLabel,
    formatToolTip,
} from './formatters';
import { sectionVisibility } from './translations/carrier-rules';
import { excludeFields } from './translations/exclude-fields';
import {
    FieldType,
    DataNode,
    DataSection,
    DocumentFormat,
    DocumentFormatType,
    DataField,
} from './types';

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
    policyNodes,
    t,
    planCode,
    policyNumber,
}: {
    policyNodes: DataNode[];
    t: TFunction;
    planCode: string;
    policyNumber: string;
}): {
    allParties: DataSection[];
    allPartiesById: Record<string, DataSection | undefined>;
} => {
    const partyRoles: DataSection[] =
        policyNodes
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

        // List of role strings keyed by partyId
        const combinedPartyRoles = {
            [role.label]: [
                ...currentPartyIdRoles,
                formatAsDataValue({
                    fieldData: partyRole,
                    t,
                }),
            ],
        };

        return {
            ...acc,
            ...combinedPartyRoles,
        };
    }, {});

    const allParties =
        policyNodes
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

                const partyLink = formatPartyLink({
                    partyId,
                    planCode,
                    policyNumber,
                });

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

export const groupSectionsForPolicy = ({
    nodes,
    t,
    planCode,
    policyNumber,
}: {
    nodes: DataNode[];
    t: TFunction;
    planCode: string;
    policyNumber: string;
}): DataNode[] => {
    const { allParties, allPartiesById } = getAllParties({
        policyNodes: nodes,
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
                    t,
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

/**
 * Filters nodes based on user-defined search string
 *
 * @param nodes - nodes to filter
 * @param search - search string
 * @returns filtered nodes
 */
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

export const formatPartyIdLink = ({
    data,
    t,
    planCode,
    policyNumber,
    policy,
}: {
    data: DataNode[];
    t: TFunction;
    planCode: string;
    policyNumber: string;
    policy: Policy;
}) => {
    const { allPartiesById } = getAllParties({
        policyNodes: convertNode(policy, t),
        t,
        planCode,
        policyNumber,
    });
    return data
        .map((node: DataNode) =>
            transformObject(node, (node) => {
                if (
                    !(node.type === FieldType.field && node.label === 'partyId')
                ) {
                    return node;
                }
                const partyReference = allPartiesById[node.value];

                if (!partyReference) {
                    return {
                        ...node,
                        link: formatPartyLink({
                            planCode,
                            policyNumber,
                            partyId: node.value,
                        }),
                    };
                }

                const partyNameField = partyReference.children
                    .filter(isDataField)
                    .find((field) => field.label === 'partyName');

                const partialPartyField: DataField = {
                    ...node,
                    label: 'impactedParty',
                    value: partyNameField?.value ?? node.value,
                    link: partyNameField?.link,
                };
                return partialPartyField;
            })
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

export const isNodeVisibileByCarrierRules = ({
    node,
    lineOfBusiness,
    productType,
    planCode,
}: {
    node: DataNode;
    lineOfBusiness?: LineOfBusiness;
    productType?: ProductType;
    planCode?: string;
}) => {
    if (node.type === FieldType.section || node.type === FieldType.field) {
        const sectionRule = sectionVisibility[node.label];
        return !sectionRule ||
            (lineOfBusiness && sectionRule.has(lineOfBusiness)) ||
            (productType && sectionRule.has(productType)) ||
            (planCode && sectionRule.has(planCode))
            ? node
            : null;
    }
    return node;
};

export const excludeNodesByCarrierRules = ({
    nodes,
    lineOfBusiness,
    productType,
    planCode,
}: {
    nodes: DataNode[];
    lineOfBusiness?: LineOfBusiness;
    productType?: ProductType;
    planCode?: string;
}) => {
    return nodes
        .map((node: DataNode) =>
            transformObject(node, (node: DataNode) =>
                isNodeVisibileByCarrierRules({
                    node,
                    lineOfBusiness,
                    productType,
                    planCode,
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

/**
 * Parses riders section to add rider participants to each rider
 *
 * @param riders - riders section
 * @param allPartiesById - all parties by id
 * @returns parsed riders section
 */
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
    t,
}: {
    systematicPrograms: DataSection;
    allPartiesById: Record<string, DataSection | undefined>;
    t: TFunction;
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
                        tags: tag
                            ? [
                                  formatAsDataValue({
                                      fieldData: tag,
                                      t,
                                  }),
                              ]
                            : undefined,
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
                children: [...systematicProgram.children, ...parties],
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
    const fundAllocationsInvestmentsById = allocation.children
        .filter(isDataSection)
        .find((section) => section.label === 'fundAllocationsInvestments')
        ?.children.reduce<Record<string, DataSection>>((acc, fund) => {
            if (fund.type !== FieldType.section) {
                return acc;
            }
            return {
                ...acc,
                [fund.label]: fund,
            };
        }, {});

    const combinedFunds: DataNode[] | undefined = allocation.children
        .filter(isDataSection)
        .find((section) => section.label === 'funds')
        ?.children.map((fund) => {
            if (fund.type !== FieldType.section) {
                return fund;
            }

            const fundName = findValueInNode({
                node: fund,
                key: 'fundName',
            });

            const namedFund: DataSection = {
                ...fund,
                label: fundName ?? fund.label,
            };

            const allocationPercentageField = findInNode({
                node: fundAllocationsInvestmentsById?.[fund.label],
                key: 'allocationPercentage',
            });
            const startDateField = findInNode({
                node: fundAllocationsInvestmentsById?.[fund.label],
                key: 'startDate',
            });

            if (allocationPercentageField) {
                namedFund.children.push(allocationPercentageField);
            }

            if (startDateField) {
                namedFund.children.push(startDateField);
            }

            return namedFund;
        })
        .filter((fund) => fund !== undefined);

    const combinedFundsSection: DataSection = {
        type: FieldType.section,
        label: 'combinedFunds',
        children: [...allocation.children.filter(isDataField)],
    };

    if (combinedFunds) {
        combinedFundsSection.children.push(...combinedFunds);
    }

    return combinedFundsSection;
}
