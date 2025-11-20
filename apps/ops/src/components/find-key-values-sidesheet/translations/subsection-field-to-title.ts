/*
 * For subsections represented as arrays, select the field that maps to the
 * subsection title.
 */
export const sectionTypeToSubSectionTitleFields: Record<string, string> = {
    charges: 'chargeType',
    features: 'featureType',
    policyFeatures: 'featureType',
    riders: 'riderName',
    riderParticipants: 'partyId',
    parties: 'partyId',
    funds: 'fundName', // FIXME: should be keyed to combinedFunds
    loans: 'loanType',
    people: 'FIXME',
    systematicPrograms: 'arrangementType',
    loanSegments: 'segmentId',
    taxes: 'partyId',
};
