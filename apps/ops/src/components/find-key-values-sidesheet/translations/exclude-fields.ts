import { DataKey } from '../types';

/**
 * Fields that should not be displayed
 */
export const excludeFields = new Set<DataKey>([
    'coverageLayers',
    'riderParticipants',
    'riderParticipant',
    'charge',
    'base',
    //'party',
    //'parties',
    'funds',
    'fundAllocationsInvestments',
    'fundSegments',
    'matchSegment',
    'loanSegments',
]);
