import { cleanup } from '@testing-library/react';

// Hoist dayjs mock before importing module under test so formatting returns deterministic values
jest.mock('dayjs', () => () => ({
    startOf: () => ({ format: () => 'START' }),
    endOf: () => ({ format: () => 'END' }),
}));

import { CaseSearchAdditionalFilters } from '@deps/contexts/CaseManagementFilters';
import { Case, Metadata, Processes, Statuses } from '@deps/models/case/case';
import { StageInstance } from '@deps/models/case/stage-instance';
import { StepInstance } from '@deps/models/case/step-instance';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

import {
    getSearchValueObject,
    getAdditionalFilters,
    isSearchValueObjectEmpty,
    insertStepDetails,
    toggleLabels,
    calculateDaysAgo,
    formatCaseTotals,
    getCaseIdentifierValue,
    getValidFullName,
} from './case-management';

import type { TFunction } from 'next-i18next';

const baseFilters = {
    processTypes: new Set([]),
    requestSubType: new Set([]),
    products: new Set([]),
};

describe('case-management.ts helper functions', () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    describe('getSearchValueObject', () => {
        it('should return an object with policyNumber when toggleValue is policyNumber and a policy number is provided', () => {
            const searchValue: SearchViewQuery = {
                policyNumber: '12345',
            };
            const toggleValue: PolicySearchKeys = 'policyNumber';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({ policyNumber: '12345' });
        });

        it('should return an object with ssn when toggleValue is ssn and an ssn is provided', () => {
            const searchValue: SearchViewQuery = {
                ssn: '123-45-6789',
            };
            const toggleValue: PolicySearchKeys = 'ssn';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({ ssn: '123456789' });
        });

        it('should return an object with agentSsn stripped of hyphens', () => {
            const searchValue: SearchViewQuery = {
                agentSsn: '987-65-4321',
            };
            const result = getSearchValueObject(searchValue, 'agentSsn');
            expect(result).toEqual({ agentSsn: '987654321' });
        });

        it('should return an object with ownerName when toggleValue is ownerFirstName and ownerFirstName and ownerLastName are provided', () => {
            const searchValue: SearchViewQuery = {
                ownerFirstName: 'John',
                ownerLastName: 'Doe',
            };
            const toggleValue: PolicySearchKeys = 'ownerFirstName';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({
                ownerFirstName: 'John',
                ownerLastName: 'Doe',
            });
        });

        it('should return an object with ownerName when toggleValue is ownerLastName and ownerFirstName and ownerLastName are provided', () => {
            const searchValue: SearchViewQuery = {
                ownerFirstName: 'John',
                ownerLastName: 'Doe',
            };
            const toggleValue: PolicySearchKeys = 'ownerLastName';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({
                ownerFirstName: 'John',
                ownerLastName: 'Doe',
            });
        });

        it('should return an empty object when no matching values are found', () => {
            const searchValue: SearchViewQuery = {};
            const toggleValue: PolicySearchKeys = 'policyNumber';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({});
        });

        it('should return caseIds array when caseId provided', () => {
            const result = getSearchValueObject(
                { caseId: 'CID-1' } as any,
                'caseId'
            );
            expect(result).toEqual({ caseIds: ['CID-1'] });
        });

        it('should return identifiers when documentNumber provided', () => {
            const result = getSearchValueObject(
                { documentNumber: 'DOC123' } as any,
                'documentNumber'
            );
            expect(result).toEqual({
                identifiers: [
                    { identifier: 'documentNumber', value: 'DOC123' },
                ],
            });
        });

        it('should return agent name fields when agentName toggle with partial inputs', () => {
            expect(
                getSearchValueObject(
                    { agentFirstName: 'Ann' } as any,
                    'agentName'
                )
            ).toEqual({ agentFirstName: 'Ann' });
            expect(
                getSearchValueObject(
                    { agentLastName: 'Lee' } as any,
                    'agentName'
                )
            ).toEqual({ agentLastName: 'Lee' });
        });

        it('should trim firmName and map to brokerDealerName', () => {
            const out = getSearchValueObject(
                { firmName: '  Big Firm  ' } as any,
                'firmName'
            );
            expect(out).toEqual({ brokerDealerName: 'Big Firm' });
        });

        it('should include fullName and owner names when provided under ownerFirstName toggle', () => {
            const out = getSearchValueObject(
                {
                    ownerFirstName: 'Al',
                    ownerLastName: 'B',
                    fullName: 'Trust',
                } as any,
                'ownerFirstName'
            );
            expect(out).toEqual({
                ownerFirstName: 'Al',
                ownerLastName: 'B',
                fullName: 'Trust',
            });
        });
    });

    describe('isSearchValueObjectEmpty', () => {
        it('should return true if there are values in the SearchValueObject', () => {
            const searchValueObject = { policyNumber: 'fakePolicyNumber' };
            const result = isSearchValueObjectEmpty(searchValueObject);
            expect(result).toEqual(false);
        });

        it('should return false if the searchValueObject is empty', () => {
            const searchValueObject = {};
            const result = isSearchValueObjectEmpty(searchValueObject);
            expect(result).toEqual(true);
        });
    });

    describe('getAdditionalFilters', () => {
        it.skip('should return an object with createdDateStart and createdDateEnd when additionalFilters include createdDateStart and createdDateEnd', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                createdDateStart: '01012022',
                createdDateEnd: '12312022',
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: 'START',
                createdDateEnd: 'END',
            });
        });

        it('should return an object with updatedDateStart and updatedDateEnd when additionalFilters include updatedDateStart and updatedDateEnd', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                updatedDateStart: '01012022',
                updatedDateEnd: '12312022',
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                updatedDateStart: 'START',
                updatedDateEnd: 'END',
            });
        });

        it('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 7', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '7',
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: 'START',
                createdDateEnd: 'END',
            });
        });

        it('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 14', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '14',
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: 'START',
                createdDateEnd: 'END',
            });
        });

        it('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 30', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '30',
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: 'START',
                createdDateEnd: 'END',
            });
        });

        it('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 31', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '31',
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: 'START',
                createdDateEnd: 'END',
            });
        });

        it('should return an empty object when additionalFilters are empty/false', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({});
        });
    });

    describe('insertStepDetails', () => {
        const caseDetails: Case = {
            id: '1',
            templateId: 'template1',
            caseStatus: Statuses.InProgress,
            carrier: 'Carrier1',
            process: Processes.NewBusiness,
            productName: 'product name',
            policyNumber: 'ABC123',
            documents: [],
            correspondenceDocs: [],
            exceptions: [],
            notes: [],
            tasks: [],
            mappedTasks: [],
            mappedExceptions: [],
            mappedNotes: null,
            mappedDocuments: [],
            parties: [],
            events: [],
            identifiers: [],
            additionalData: {},
            stages: [
                {
                    id: 'stage1',
                    steps: [
                        {
                            id: 'step1',
                        },
                        {
                            id: 'step2',
                        },
                        {
                            id: 'step3',
                        },
                    ] as StepInstance[],
                },
                {
                    id: 'stage2',
                    steps: [
                        {
                            id: 'step3',
                        },
                        {
                            id: 'step4',
                        },
                    ],
                },
            ] as StageInstance[],
            createdAt: '',
            updatedAt: '',
        };

        const metadata: Metadata = {
            stages: {
                stage1: {
                    steps: {
                        step1: {
                            info: 'Stage 1 Step 1 Info',
                        },
                        step2: {
                            info: 'Stage 1 Step 2 Info',
                        },
                    },
                },
            },
        };

        const expectedUpdatedStage = {
            id: 'stage1',
            steps: [
                {
                    id: 'step1',
                    info: 'Stage 1 Step 1 Info',
                },
                {
                    id: 'step2',
                    info: 'Stage 1 Step 2 Info',
                },
                {
                    id: 'step3',
                },
            ] as StepInstance[],
        };

        it('should return updated step data with correct info when steps are included in metadata', () => {
            const result = insertStepDetails(caseDetails, metadata);

            expect(result.stages[0]).toEqual(expectedUpdatedStage);
        });

        it('should return unedited stage details when stage is not included in metadata', () => {
            const result = insertStepDetails(caseDetails, metadata);
            const noMetadataStage = result.stages[1];

            expect(noMetadataStage.id).toEqual('stage2');

            for (const step of noMetadataStage.steps || []) {
                expect(step.info).toEqual(undefined);
            }

            expect(result.stages[1]).toEqual(caseDetails.stages[1]);
        });

        it('should return unedited step data when step is not included in metadata', () => {
            const result = insertStepDetails(caseDetails, metadata);

            const targetStageSteps = result.stages[0].steps || [];

            expect(targetStageSteps[0].info).not.toEqual(undefined);
            expect(targetStageSteps[1].info).not.toEqual(undefined);
            expect(targetStageSteps[2].info).toEqual(undefined);
        });
    });

    describe('toggleLabels', () => {
        const t: TFunction = ((key: any) =>
            `t:${Array.isArray(key) ? key[0] : key}`) as any;

        it('should include trust/org fields when feature flag is enabled', () => {
            const flags = {
                enterprise_search_trust_or_organization: true,
            } as any;
            const labels = toggleLabels(flags)(t);
            const owner = labels.find(
                (l) => l.value === 'ownerFirstName'
            ) as any;
            expect(owner.group.length).toBe(3);
            expect(owner.group[2].value).toBe('fullName');
        });

        it('should include only first/last name when feature flag is disabled', () => {
            const flags = {
                enterprise_search_trust_or_organization: false,
            } as any;
            const labels = toggleLabels(flags)(t);
            const owner = labels.find(
                (l) => l.value === 'ownerFirstName'
            ) as any;
            expect(owner.group.length).toBe(2);
            expect(owner.group[0].value).toBe('firstName');
            expect(owner.group[1].value).toBe('lastName');
        });
    });

    describe('calculateDaysAgo', () => {
        beforeAll(() => {
            jest.useFakeTimers({ now: new Date('2024-02-15T12:00:00Z') });
        });
        afterAll(() => {
            jest.useRealTimers();
        });

        it('returns 0 when same day and less than 24 hours', () => {
            // Use a time safely earlier on the same calendar day in local time
            const date = new Date('2024-02-15T11:00:00Z');
            expect(calculateDaysAgo(date)).toBe(0);
        });

        it('returns 1 when different calendar day but less than 24 hours', () => {
            // Choose a time that is previous local calendar day
            // At now=2024-02-15T12:00:00Z, using 2024-02-14T18:00:00Z is <24h and previous local date
            const date = new Date('2024-02-14T18:00:00Z');
            expect(calculateDaysAgo(date)).toBe(1);
        });

        it('returns 2 when 49 hours ago', () => {
            const date = new Date('2024-02-13T11:00:00Z');
            expect(calculateDaysAgo(date)).toBe(2);
        });
    });

    describe('formatCaseTotals', () => {
        it('maps stat counts and falls back to 0 for missing labels', () => {
            const out = formatCaseTotals(10, {
                counts: [
                    { label: Statuses.InProgress, value: 2 },
                    { label: Statuses.Exception, value: 3 },
                ],
            } as any);
            expect(out.All).toBe(10);
            expect(out[Statuses.InProgress]).toBe(2);
            expect(out[Statuses.Exception]).toBe(3);
            expect(out[Statuses.NotStarted]).toBe(0);
            expect(out[Statuses.Completed]).toBe(0);
            expect(out[Statuses.Canceled]).toBe(0);
        });
    });

    describe('getCaseIdentifierValue', () => {
        it('returns identifier value when present', () => {
            const out = getCaseIdentifierValue(
                [
                    { identifier: 'x', value: '1' },
                    { identifier: 'target', value: 'FOUND' },
                ] as any,
                'target'
            );
            expect(out).toBe('FOUND');
        });
        it('returns empty string when not found or list undefined', () => {
            expect(getCaseIdentifierValue(undefined as any, 'x')).toBe('');
            expect(
                getCaseIdentifierValue(
                    [{ identifier: 'y', value: '2' }] as any,
                    'x'
                )
            ).toBe('');
        });
    });

    describe('getValidFullName', () => {
        it('returns provided fullName if present', () => {
            expect(getValidFullName({ fullName: 'John Q Public' } as any)).toBe(
                'John Q Public'
            );
        });
        it('constructs full name from parts, tolerating missing middle/last', () => {
            expect(
                getValidFullName({ firstName: 'Ann', lastName: 'Lee' } as any)
            ).toBe('Ann  Lee');
            expect(getValidFullName({ firstName: 'Solo' } as any)).toBe(
                'Solo  '
            );
        });
        it('returns undefined when owner is undefined', () => {
            expect(getValidFullName(undefined as any)).toBeUndefined();
        });
    });
});
