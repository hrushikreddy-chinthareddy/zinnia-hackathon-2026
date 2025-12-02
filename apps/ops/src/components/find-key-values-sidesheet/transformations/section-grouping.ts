import { TFunction } from 'next-i18next';

import { formatAsDataValue, formatPartyLink } from './formatters';
import {
    isDataSection,
    isDataField,
    isDataSectionOrGroup,
} from '../data-node-helpers/predicates';
import {
    findValueInNode,
    findInNode,
    findFieldInNode,
    findSectionInNodes,
} from '../data-node-helpers/traversal';
import { FieldType, DataNode, DataSection } from '../types';

/**
 * Groups basics for policy
 *
 * @param data - data to group
 * @returns grouped basics
 */
export const groupBasicsForPolicy = (data: DataNode[]): DataNode[] => {
    const filterByField = data.filter(isDataField);
    const filterBySectionOrGroup = data.filter(isDataSectionOrGroup);

    return [
        {
            type: FieldType.section,
            label: 'policyBasics',
            children: filterByField,
        },
        ...filterBySectionOrGroup,
    ];
};

/**
 * Groups basics for transaction
 *
 * @param data - data to group
 * @returns grouped basics
 */
export const groupBasicsForTransaction = (data: DataNode[]): DataNode[] => {
    const filterByField = data.filter(isDataField);
    const filterBySectionOrGroup = data.filter(isDataSectionOrGroup);

    return [
        {
            type: FieldType.section,
            label: 'transactionDetails',
            children: filterByField,
        },
        ...filterBySectionOrGroup,
    ];
};

/**
 * Groups sections for policy
 *
 * @param nodes - nodes to group
 * @param t - translation function
 * @param planCode - plan code
 * @param policyNumber - policy number
 * @returns grouped sections
 */
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
            const includeFields = ['partyName', 'dob', 'ssn'];
            return {
                type: FieldType.section,
                // Remap label to partyName for rendering
                label:
                    findValueInNode({
                        node: party,
                        key: 'partyName',
                    }) ?? party.label,
                children: party.children
                    .filter(isDataField)
                    .filter((child) => includeFields.includes(child.label)),
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
                const loans = findSectionInNodes({
                    nodes: node.children,
                    key: 'loansSegments',
                });

                if (loans) {
                    loans.children.push(...node.children);
                }

                return groupAllocation({
                    allocation: node,
                });
            }

            case 'systematicPrograms':
                return groupSystematicPrograms({
                    systematicPrograms: node,
                    allPartiesById,
                    t,
                });

            case 'riders':
                return groupRiders({
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

    return [...combinedSections, loans, people];
};

/**
 * Groups taxes section to add tax basis, withholding instructions,
 * and withheld amounts to each field
 *
 * @param data - data to group
 * @returns taxes section with tax basis added
 */
export const groupTaxesSection = (data: DataNode[]): DataNode[] => {
    const taxBasisFields =
        findSectionInNodes({ nodes: data, key: 'taxBasis' })?.children.filter(
            isDataField
        ) ?? [];

    const taxWithholdingInstructions = findSectionInNodes({
        nodes: data,
        key: 'taxWithholdingInstructions',
    });

    const taxWithheldAmounts = findSectionInNodes({
        nodes: data,
        key: 'taxWithheldAmounts',
    });

    const excludeSections = [
        'taxBasis',
        'taxWithholdingInstructions',
        'taxWithheldAmounts',
    ];
    const filterByNonTaxes = data
        .filter(isDataSection)
        .filter((node) => !excludeSections.includes(node.label));

    const combinedTaxes: DataSection = {
        type: FieldType.section,
        label: 'taxes',
        children: [...taxBasisFields],
    };

    if (taxWithholdingInstructions) {
        combinedTaxes.children.push(taxWithholdingInstructions);
    }

    if (taxWithheldAmounts) {
        combinedTaxes.children.push(taxWithheldAmounts);
    }
    return [...filterByNonTaxes, combinedTaxes];
};

/**
 * Groups riders section to add rider participants to each rider
 *
 * @param riders - riders section
 * @param allPartiesById - all parties by id
 * @returns grouped riders section
 */
function groupRiders({
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

        const partiesSection = findSectionInNodes({
            nodes: rider.children,
            key: 'riderParticipants',
        });

        const parties: DataSection[] =
            partiesSection?.children.filter(isDataSection).map((party) => {
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

/**
 * Groups systematic programs section to add party roles to each party
 *
 * @param systematicPrograms - systematic programs section
 * @param allPartiesById - all parties by id
 * @param t - translation function
 * @returns systematic programs section with party roles added
 */
function groupSystematicPrograms({
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
            const partiesSection = findSectionInNodes({
                nodes: systematicProgram.children,
                key: 'parties',
            });

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

/**
 * Groups allocation section to add fund allocations to each fund
 *
 * @param allocation - allocation section
 * @returns allocation section with fund allocations added
 */
function groupAllocation({
    allocation,
}: {
    allocation: DataSection;
}): DataSection {
    const fundAllocationsInvestmentsById = findSectionInNodes({
        nodes: allocation.children,
        key: 'fundAllocationsInvestments',
    })?.children.reduce<Record<string, DataSection>>((acc, fund) => {
        if (fund.type !== FieldType.section) {
            return acc;
        }
        return {
            ...acc,
            [fund.label]: fund,
        };
    }, {});

    const combinedFunds: DataNode[] | undefined = findSectionInNodes({
        nodes: allocation.children,
        key: 'funds',
    })
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
        .filter((fund) => fund != null);

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

/**
 * Groups parties section to add party roles to each party
 * and key each party by partyId
 *
 * @param parties - parties section
 * @returns parties section with party roles added
 */
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
        findSectionInNodes({
            nodes: policyNodes,
            key: 'partyRoles',
        })?.children.filter(isDataSection) ?? [];

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
        findSectionInNodes({
            nodes: policyNodes,
            key: 'parties',
        })
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
