/**
 * Fields that should not be displayed
 */
export const excludeFields = new Set<string>([
    'id',
    'version',
    'event',
    'coverageLayers',
    'riderParticipants',
    'riderParticipant',
    'charge',
    'base',
    'party',
    'parties',
    'partyRole',
    'partyRoles',
    'fundAllocationsInvestments',
    'fundSegments',
    'matchSegment',
    'loanValues',
    'loanSegments',
    'policyReferenceId',
    'thirdPartyAdministratorId',
    'matchBonusVersion',
    'timestamp',
    'modelId',
]);
