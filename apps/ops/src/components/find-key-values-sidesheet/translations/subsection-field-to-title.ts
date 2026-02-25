/*
 * For subsections represented as arrays, select the field that maps to the
 * subsection title.
 */
export const sectionTypeToSubSectionTitleFields: Record<string, string> = {
    charges: 'chargeType',
    features: 'featureType',
    policyFeatures: 'featureType',
    riders: 'riderName',
    parties: 'partyId',
    funds: 'fundId',
    fundAllocationsInvestments: 'fundId',
    loans: 'loanType',
    partyRoles: 'partyId',
    identifications: 'identificationType',
    systematicPrograms: 'arrangementType',
    loanSegments: 'segmentId',
    fundSegments: 'segmentId',
    rates: 'rateType',
    taxes: 'partyId',
};
