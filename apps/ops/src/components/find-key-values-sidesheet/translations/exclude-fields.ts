/**
 * Use case identifiers for field visibility configuration.
 * - `default`: Standard FKV sidesheets (policy, transaction)
 * - `funds`: Revised Fund Sidesheets with full fund data display
 */
export type ExcludeFieldsUseCase = 'default' | 'funds' | 'riders';

/**
 * Fields that should not be displayed, keyed by use case.
 */
export const excludeFieldsConfig: Record<ExcludeFieldsUseCase, Set<string>> = {
    default: new Set<string>([
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
        'marketValueAdjustmentAmount',
        'matchSegment',
        'loanValues',
        'loanSegments',
        'policyReferenceId',
        'thirdPartyAdministratorId',
        'matchBonusVersion',
        'timestamp',
        'modelId',
    ]),
    funds: new Set<string>(['investmentType', 'modelName', 'modelId']),
    riders: new Set<string>([]),
};

/**
 * Gets the set of fields to exclude for a given use case.
 *
 * @param useCase - The use case identifier (defaults to 'default')
 * @returns Set of field names to exclude from display
 */
export const getExcludeFields = (
    useCase: ExcludeFieldsUseCase = 'default'
): Set<string> => excludeFieldsConfig[useCase];
