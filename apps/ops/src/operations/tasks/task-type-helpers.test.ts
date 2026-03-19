import { SswUpdateOption } from '@deps/models/case/enums';
import { ManagementTask } from '@deps/models/case/task-instance';

import { getUpdateType } from './task-type-helpers';

/**
 * Sample task payloads (from real API responses) used to test getUpdateType mapping.
 * Kept inline so tests are self-contained after sample.json is removed.
 */
const sampleTasks: ManagementTask[] = [
    {
        id: 'TA000000069250',
        caseId: 'CA0000603881',
        source: 'BPM.SSW',
        process: 'Systematic Program Update',
        carrier: 'NASU',
        taskType: 'SSWFormInputTask',
        taskName: 'Data entry',
        status: 'COMPLETED',
        createdAt: '2026-01-05T14:24:28Z',
        updatedAt: '2026-01-05T15:57:29Z',
        data: {
            formRequest: {
                formUpdateData: {
                    updateType: 'BankUpdate',
                    contractNumber: '8640000391',
                    bank: [{ accountNumber: '31000698424', bankName: 'SBIN' }],
                    programs: null,
                },
            },
        },
    } as ManagementTask,
    {
        id: 'TA000000074601',
        caseId: 'CA0000603881',
        process: 'Systematic Program Update',
        carrier: 'NASU',
        taskType: 'SSWFormInputTask',
        taskName: 'Data entry',
        status: 'COMPLETED',
        createdAt: '2026-02-06T07:47:14Z',
        updatedAt: '2026-02-06T07:55:15Z',
        data: {
            formRequest: {
                formUpdateData: {
                    updateType: 'ProgramUpdate',
                    contractNumber: '8640000391',
                    bank: null,
                    programs: [
                        {
                            programType: 'SSW',
                            allocationId: 927394,
                            amount: '20000',
                            frequency: 'Monthly',
                            nextDate: { text: '2026-02-19' },
                        },
                    ],
                },
            },
        },
    } as ManagementTask,
    {
        id: 'TA000000074621',
        caseId: 'CA0000603881',
        process: 'Systematic Program Update',
        carrier: 'NASU',
        taskType: 'SSWFormInputTask',
        taskName: 'Data entry',
        status: 'COMPLETED',
        createdAt: '2026-02-06T09:34:28Z',
        updatedAt: '2026-03-05T07:01:51Z',
        data: {
            formRequest: {
                formUpdateData: {
                    updateType: 'ProgramUpdate',
                    contractNumber: '8640000391',
                    bank: null,
                    programs: [
                        {
                            programType: 'SSW',
                            allocationId: 1035551,
                            amount: '30000',
                            duration: '3',
                            frequency: 'Quarterly',
                            nextDate: { text: '2026-03-20' },
                        },
                    ],
                },
            },
        },
    } as ManagementTask,
    {
        id: 'TA000000079773',
        caseId: 'CA0000603881',
        process: 'Systematic Program Update',
        carrier: 'NASU',
        taskType: 'SSWFormInputTask',
        taskName: 'Data entry',
        status: 'COMPLETED',
        createdAt: '2026-03-05T07:08:00Z',
        updatedAt: '2026-03-05T07:10:10Z',
        data: {
            formRequest: {
                formUpdateData: {
                    updateType: null,
                    contractNumber: null,
                    bank: null,
                    programs: null,
                },
            },
        },
    } as ManagementTask,
    {
        id: 'TA000000079896',
        caseId: 'CA0000603881',
        process: 'Systematic Program Update',
        carrier: 'NASU',
        taskType: 'SSWFormInputTask',
        taskName: 'Data entry',
        status: 'COMPLETED',
        createdAt: '2026-03-05T10:11:46Z',
        updatedAt: '2026-03-05T13:57:46Z',
        data: {
            formRequest: {
                formUpdateData: {
                    updateType: 'ProgramUpdate',
                    contractNumber: '8640000391',
                    bank: null,
                    programs: [
                        {
                            programType: 'SSW',
                            allocationId: 1042533,
                            amount: '30001',
                            duration: '3',
                            frequency: 'Quarterly',
                            nextDate: { text: '2026-03-20' },
                        },
                    ],
                },
            },
        },
    } as ManagementTask,
    {
        id: 'TA000000080107',
        caseId: 'CA0000603881',
        process: 'Systematic Program Update',
        carrier: 'NASU',
        taskType: 'SSWFormInputTask',
        taskName: 'Data entry',
        status: 'NEW',
        createdAt: '2026-03-05T14:05:07Z',
        updatedAt: '2026-03-05T14:05:07Z',
        data: {
            formRequest: {
                formUpdateData: {
                    updateType: null,
                    contractNumber: null,
                    bank: null,
                    programs: null,
                },
            },
        },
    } as ManagementTask,
];

describe('task-type-helpers', () => {
    describe('getUpdateType', () => {
        it('returns BANK_UPDATE for task with updateType BankUpdate (sample task 1)', () => {
            expect(getUpdateType(sampleTasks[0])).toBe(
                SswUpdateOption.BANK_UPDATE
            );
        });

        it('returns SSW_UPDATE for ProgramUpdate task with SSW program (sample tasks 2, 3, 5)', () => {
            expect(getUpdateType(sampleTasks[1])).toBe(
                SswUpdateOption.SSW_UPDATE
            );
            expect(getUpdateType(sampleTasks[2])).toBe(
                SswUpdateOption.SSW_UPDATE
            );
            expect(getUpdateType(sampleTasks[4])).toBe(
                SswUpdateOption.SSW_UPDATE
            );
        });

        it('returns null when updateType is null (sample tasks 4, 6)', () => {
            expect(getUpdateType(sampleTasks[3])).toBeNull();
            expect(getUpdateType(sampleTasks[5])).toBeNull();
        });

        it('returns WITHHOLDING_UPDATE for updateType TaxWithholdingUpdate', () => {
            const task: ManagementTask = {
                ...sampleTasks[0],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: 'TaxWithholdingUpdate',
                            contractNumber: '8640000391',
                            bank: null,
                            programs: null,
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBe(
                SswUpdateOption.WITHHOLDING_UPDATE
            );
        });

        it('returns BANK_UPDATE for updateType BankTerminate', () => {
            const task: ManagementTask = {
                ...sampleTasks[0],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: 'BankTerminate',
                            contractNumber: '8640000391',
                            bank: null,
                            programs: null,
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBe(SswUpdateOption.BANK_UPDATE);
        });

        it('returns RMD_UPDATE for ProgramUpdate task with RMD program', () => {
            const task: ManagementTask = {
                ...sampleTasks[1],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: 'ProgramUpdate',
                            contractNumber: '8640000391',
                            bank: null,
                            programs: [{ programType: 'RMD' }],
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBe(SswUpdateOption.RMD_UPDATE);
        });

        it('returns EFT_DRAW_UPDATE for ProgramUpdate task with EFT program', () => {
            const task: ManagementTask = {
                ...sampleTasks[1],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: 'ProgramUpdate',
                            contractNumber: '8640000391',
                            bank: null,
                            programs: [{ programType: 'EFT' }],
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBe(SswUpdateOption.EFT_DRAW_UPDATE);
        });

        it('returns EFT_DRAW_UPDATE for ProgramUpdate task with EFT Draw program type', () => {
            const task: ManagementTask = {
                ...sampleTasks[1],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: 'ProgramUpdate',
                            contractNumber: '8640000391',
                            bank: null,
                            programs: [{ programType: 'EFT Draw' }],
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBe(SswUpdateOption.EFT_DRAW_UPDATE);
        });

        it('returns null when task has no formUpdateData', () => {
            const task: ManagementTask = {
                ...sampleTasks[0],
                data: { formRequest: {} },
            };
            expect(getUpdateType(task)).toBeNull();
        });

        it('returns null when task has no updateType', () => {
            const task: ManagementTask = {
                ...sampleTasks[0],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: undefined,
                            contractNumber: '8640000391',
                            bank: null,
                            programs: null,
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBeNull();
        });

        it('returns null when ProgramUpdate has empty programs', () => {
            const task: ManagementTask = {
                ...sampleTasks[1],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: 'ProgramUpdate',
                            contractNumber: '8640000391',
                            bank: null,
                            programs: [],
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBeNull();
        });

        it('returns null when ProgramUpdate has null programs', () => {
            const task: ManagementTask = {
                ...sampleTasks[1],
                data: {
                    formRequest: {
                        formUpdateData: {
                            updateType: 'ProgramUpdate',
                            contractNumber: '8640000391',
                            bank: null,
                            programs: null,
                        },
                    },
                },
            };
            expect(getUpdateType(task)).toBeNull();
        });
    });
});
