/*
 * For subsections represented as arrays, select the field that maps to the
 * subsection title.
 */
export const sectionTypeToSubSectionTitleFields: Record<string, string> = {
    charges: 'chargeType',
    features: 'featureType',
    policyFeatures: 'featureType',
    riders: 'riderName',
    funds: 'fundName',
    loans: 'loanType',
    people: 'FIXME',
    systematicPrograms: 'arrangementType',
    loanSegments: 'segmentId',
};
