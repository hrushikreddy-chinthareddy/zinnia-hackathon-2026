import { DataKey } from '../types';

/**
 * Fields that should not be displayed
 */
export const excludeFields = new Set<DataKey>([
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
    'funds',
    'fundAllocationsInvestments',
    'fundSegments',
    'matchSegment',
    'loanSegments',
    'policyReferenceId',
    'thirdPartyAdministratorId',
    'matchBonusVersion',
    'timestamp',
    'modelId',
]);
