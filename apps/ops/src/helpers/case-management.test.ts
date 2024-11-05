import { CaseSearchAdditionalFilters } from '@deps/contexts/CaseManagementFilters';
import { Case, Metadata, Processes, Statuses } from '@deps/models/case/case';
import { StageInstance } from '@deps/models/case/stage-instance';
import { StepInstance } from '@deps/models/case/step-instance';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

import { getSearchValueObject, getAdditionalFilters, isSearchValueObjectEmpty, insertStepDetails } from './case-management';

const baseFilters = {
    processTypes: new Set([]),
    requestSubType: new Set([]),
    products: new Set([]),
};

describe('case-management.ts helper functions', () => {
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

        it('should return an object with ownerName when toggleValue is ownerFirstName and ownerFirstName and ownerLastName are provided', () => {
            const searchValue: SearchViewQuery = {
                ownerFirstName: 'John',
                ownerLastName: 'Doe',
            };
            const toggleValue: PolicySearchKeys = 'ownerFirstName';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({ ownerFirstName: 'John', ownerLastName: 'Doe' });
        });

        it('should return an object with ownerName when toggleValue is ownerLastName and ownerFirstName and ownerLastName are provided', () => {
            const searchValue: SearchViewQuery = {
                ownerFirstName: 'John',
                ownerLastName: 'Doe',
            };
            const toggleValue: PolicySearchKeys = 'ownerLastName';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({ ownerFirstName: 'John', ownerLastName: 'Doe' });
        });

        it('should return an empty object when no matching values are found', () => {
            const searchValue: SearchViewQuery = {};
            const toggleValue: PolicySearchKeys = 'policyNumber';

            const result = getSearchValueObject(searchValue, toggleValue);

            expect(result).toEqual({});
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
                createdDateStart: '2022-01-01T00:00:00.000Z',
                createdDateEnd: '2022-12-31T00:00:00.000Z',
            });
        });

        it.skip('should return an object with updatedDateStart and updatedDateEnd when additionalFilters include updatedDateStart and updatedDateEnd', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                updatedDateStart: '01012022',
                updatedDateEnd: '12312022',
            };

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                updatedDateStart: '2022-01-01T00:00:00.000Z',
                updatedDateEnd: '2022-12-31T00:00:00.000Z',
            });
        });

        it.skip('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 7', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '7',
            };

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const endDate = new Date();

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
                createdDateEnd: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
            });
        });

        it.skip('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 14', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '14',
            };

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 14);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - 7);

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
                createdDateEnd: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
            });
        });

        it.skip('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 30', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '30',
            };

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - 15);

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
                createdDateEnd: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
            });
        });

        it.skip('should return an object with createdDateStart and createdDateEnd when additionalFilters include age 31', () => {
            const additionalFilters: CaseSearchAdditionalFilters = {
                ...baseFilters,
                age: '31',
            };

            const startDate = new Date('01/01/1970');
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - 31);

            const result = getAdditionalFilters(additionalFilters);

            expect(result).toEqual({
                createdDateStart: `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
                createdDateEnd: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate
                    .getDate()
                    .toString()
                    .padStart(2, '0')}T00:00:00.000Z`,
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
});
