import { TFunction } from 'next-i18next';

import {
    FinancialTransactionEntity,
    FinancialTransactionEntityTransaction,
} from '@deps/models/case/financial-transactions';

import {
    findValueInNode,
    findInNode,
    findFieldInNode,
    findSectionInNodes,
    findValueInNodes,
} from '../data-node-helpers/traversal';
import { FieldType, DataNode, DataSection, DataField } from '../types';
import {
    formatAsDataValue,
    formatPartyLink,
    enumsMapping,
    formatNode,
    getTooltipByValue,
} from './formatters';
import {
    applyTransformationsToNodes,
    buildRenderTreeFromSourceData,
    transformNodes,
} from '../data-node-helpers/mutations';
import {
    isDataSection,
    isDataField,
    isDataSectionOrGroup,
    isDataSectionOrField,
    isDataGroup,
} from '../data-node-helpers/predicates';
import { defaultNotAvailableFields } from '../translations/default-not-available-fields';

const filterAccountingEntryDataFields = (accountingEntry: DataNode) => {
    if (!isDataSection(accountingEntry)) {
        return [accountingEntry];
    }
    const entryFieldsToDisplay = [
        'accountEntryType',
        'accountNumber',
        'accountPeriod',
        'ledgerType',
        'ledgerGroup',
        'sourceSystem',
        'state',
        'currency',
        'amount',
        'fundId',
        'distributionChannel',
        'accountingMethod',
        'transactionDate',
        'unit',
    ];

    return accountingEntry?.children
        ?.filter(isDataField || isDataSection)
        ?.filter((child) => entryFieldsToDisplay.includes(child.label));
};

export const addAccountingEntriesGroup = (
    data: DataNode[],
    accountingEntries: DataNode[]
): DataNode[] => {
    if (!accountingEntries?.length) return data;

    const cleanedAccountingEntries = accountingEntries.map(
        filterAccountingEntryDataFields
    );

    const accountingEntriesSection: DataSection = {
        type: FieldType.section,
        label: 'accounting',
        children: [
            { type: FieldType.group, children: cleanedAccountingEntries },
        ],
    };

    return [...data, accountingEntriesSection];
};

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
            const partyName = findValueInNode({
                node: party,
                key: 'partyName',
            });
            return {
                type: FieldType.section,
                // Remap label to partyName for rendering
                label: partyName ?? party.label,
                isPIILabel: partyName ? true : false,
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
                }) ?? {
                    type: FieldType.field,
                    value: partyId,
                    isPII: false,
                };

                const retainedFields = ['partyAgeAtIssue'];
                const hydratedParty: DataSection = {
                    ...party,
                    label: partyNameField?.value ?? partyId,
                    isPIILabel: partyNameField?.isPII,
                    children: [
                        {
                            ...partyNameField,
                            label: 'coveredParty',
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
                    }) ?? {
                        type: FieldType.field,
                        value: partyId,
                        isPII: false,
                    };

                    const retainedFields = ['paymentForm'];
                    const hydratedParty: DataSection = {
                        ...party,
                        label: partyNameField?.value ?? partyId,
                        isPIILabel: partyNameField?.isPII,
                        children: [
                            {
                                ...partyNameField,
                                label: 'partyName',
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
    const matchSegment = groupPremiumBonusSegment({
        allocationNode: allocation,
    });

    if (matchSegment) {
        combinedFundsSection.children.push(matchSegment);
    }

    return combinedFundsSection;
}

function groupPremiumBonusSegment({
    allocationNode,
}: {
    allocationNode: DataSection | undefined;
}): DataSection | undefined {
    if (!allocationNode) {
        return undefined;
    }
    const matchSegmentSection = findSectionInNodes({
        nodes: allocationNode?.children ?? [],
        key: 'matchSegment',
    });

    if (!matchSegmentSection) {
        return undefined;
    }

    const premiumBonusFields = [
        'unvestedPremiumBonus',
        'totalRecapturedPremiumBonus',
        'matchVestingDate',
        'generalLedgerFundCode',
        'vestingPeriod',
    ];

    return {
        type: FieldType.section,
        label: 'premiumBonus',
        children: matchSegmentSection.children.filter(
            (node) =>
                isDataGroup(node) ||
                (isDataSectionOrField(node) &&
                    premiumBonusFields.includes(node.label))
        ),
    };
}

/**
 * Groups a single combined fund into a 3-level nested structure for the Revised Fund Sidesheet.
 *
 * Structure:
 * - Level 1: Fund (header = fundName, contains all fund-level fields)
 * - Level 2: Segments (accordion per segment, title = "Segment {segmentId}")
 * - Level 3: Rates (accordion per rate within segment, title = "Segment {segmentId} rates")
 *
 * @param nodes - Array of data nodes from buildRenderTreeFromSourceData
 * @param t - Translation function
 * @returns Grouped fund section with nested segments and rates
 */
export function groupSingleFundDetails({
    nodes,
    t,
}: {
    nodes: DataNode[];
    t: TFunction;
}): DataSection[] {
    const fundName = findValueInNodes({ nodes, key: 'fundName' });
    const fundId = findValueInNodes({ nodes, key: 'fundId' });
    const fundLabel = fundName || fundId;

    if (!fundLabel) {
        return [];
    }

    // Collect all fund-level fields (excluding nested sections)
    const fundFields: DataField[] = nodes.filter(isDataField);

    // Process Level 2: Segments
    const fundSegmentsSection = findSectionInNodes({
        nodes,
        key: 'fundSegments',
    });

    const relabeledSegmentSections: DataSection[] =
        fundSegmentsSection?.children
            .filter(isDataSection)
            .map((segmentNode) => {
                // Collect all segment fields (excluding nested sections like 'rates')
                const segmentFields: DataNode[] =
                    segmentNode.children.filter(isDataField);

                // Process Level 3: Rates
                const ratesSection = findSectionInNodes({
                    nodes: segmentNode.children,
                    key: 'rates',
                });

                const rateSections: DataSection[] =
                    ratesSection?.children
                        .filter(isDataSection)
                        .map((rateNode) => {
                            // Collect all rate fields
                            const rateFields: DataNode[] =
                                rateNode.children.filter(isDataField);

                            return {
                                type: FieldType.section,
                                label: `${t('allFields.segment')} ${
                                    segmentNode.label
                                } ${rateNode.label} ${t('allFields.rates')}`,
                                children: rateFields,
                            };
                        }) ?? [];

                // Build segment section with nested rates
                const segmentSection: DataSection = {
                    type: FieldType.section,
                    label: `${t('allFields.segment')} ${segmentNode.label}`,
                    children: [...segmentFields, ...rateSections],
                };

                return segmentSection;
            }) ?? [];

    // Build final fund section
    return [
        {
            type: FieldType.section,
            label: fundLabel,
            children: [...fundFields, ...relabeledSegmentSections],
        },
    ];
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
                    isPIILabel: true,

                    // Selectively populated below
                    children: [
                        {
                            type: FieldType.field,
                            label: 'partyName',
                            value: partyName,
                            link: partyLink,
                            isPII: true,
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
                        isPII: true,
                    });
                }

                if (dob) {
                    personSection.children.push({
                        type: FieldType.field,
                        label: 'dob',
                        value: dob,
                        isPII: true,
                    });
                }
                if (bankInfo) {
                    personSection.children.push({
                        type: FieldType.field,
                        label: 'bankInfo',
                        value: bankInfo,
                        isPII: true,
                    });
                }
                if (addressInfo) {
                    personSection.children.push({
                        type: FieldType.field,
                        label: 'addressInfo',
                        value: addressInfo,
                        isPII: true,
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

/**
 * Groups basics for financial transaction
 *
 * @param data - data to group
 * @returns grouped basics
 */
export const groupBasicsForFinancialTransaction = (
    data: DataNode[]
): DataNode[] => {
    const filterBySectionOrGroup = data.filter(isDataSectionOrField);

    return [...filterBySectionOrGroup];
};

/**
 * Gets financial transactions
 *
 * @param financialTransaction - financial transaction
 * @param t - translation function
 * @returns financial transactions
 */
export const getFinancialTransactions = (
    financialTransaction:
        | FinancialTransactionEntity
        | FinancialTransactionEntityTransaction
        | null,
    t: TFunction
) => {
    const policyNomenclature = 'transaction';
    const notyetavailablefields = Array.from(defaultNotAvailableFields);
    return applyTransformationsToNodes(
        (nodes) =>
            buildRenderTreeFromSourceData(nodes, t, notyetavailablefields),
        (nodes) => groupBasicsForFinancialTransaction(nodes),
        (nodes) =>
            // Transforms the entire tree, chaining transformations on *each node*
            transformNodes({
                nodes,
                transforms: [
                    (node) =>
                        // Adds a tooltip to the node if it exists in the tooltip mapping
                        getTooltipByValue({
                            node,
                            t,
                            policyNomenclature,
                        }),
                    (node) =>
                        // transform the value by enums
                        enumsMapping({
                            node,
                            t,
                            policyNomenclature,
                        }),

                    (node) =>
                        // Applies translations and formats dates, currencies, etc.
                        formatNode({
                            node,
                            t,
                        }),
                ],
            })
    )(financialTransaction);
};
