import { SswUpdateOption } from '@deps/models/case/enums';

import { buildTaskLink, toFormattedTask } from './task-listing.helpers';
import { Task } from './task-listing.types';

const mockT = ((key: string) => key) as any;

describe('task-listing.helpers', () => {
    describe('buildTaskLink', () => {
        const taskId = 'TA000000074601';
        const caseId = 'CA0000603881';
        const caseType = 'SSW';
        const documentNumber = '20260105-EM-093384';
        const clientId = 'NASU';

        describe('feature flag off (enableSSWReadonly false or undefined)', () => {
            it('returns create-case link when enableSSWReadonly is undefined', () => {
                const link = buildTaskLink(
                    taskId,
                    caseId,
                    caseType,
                    documentNumber,
                    clientId,
                    SswUpdateOption.SSW_UPDATE
                );
                expect(link).toContain('/create-case/');
                expect(link).toContain(`taskId=${taskId}`);
                expect(link).toContain(`doc=${documentNumber}`);
                expect(link).toContain(`clientId=${clientId}`);
                expect(link).not.toContain('/ssw-edit/ssw-update');
            });

            it('returns create-case link when enableSSWReadonly is false', () => {
                const link = buildTaskLink(
                    taskId,
                    caseId,
                    caseType,
                    documentNumber,
                    clientId,
                    SswUpdateOption.SSW_UPDATE,
                    false
                );
                expect(link).toContain('/create-case/');
                expect(link).not.toContain('/ssw-edit/ssw-update');
            });

            it('returns create-case link for any updateType when FF is off', () => {
                expect(
                    buildTaskLink(
                        taskId,
                        caseId,
                        caseType,
                        documentNumber,
                        clientId,
                        SswUpdateOption.BANK_UPDATE,
                        false
                    )
                ).toContain('/create-case/');
                expect(
                    buildTaskLink(
                        taskId,
                        caseId,
                        caseType,
                        documentNumber,
                        clientId,
                        null,
                        false
                    )
                ).toContain('/create-case/');
            });
        });

        describe('feature flag on (enableSSWReadonly true)', () => {
            it('returns ssw-edit link when updateType is SSW_UPDATE', () => {
                const link = buildTaskLink(
                    taskId,
                    caseId,
                    caseType,
                    documentNumber,
                    clientId,
                    SswUpdateOption.SSW_UPDATE,
                    true
                );
                expect(link).toBe(
                    `/ssw-edit/ssw-update?taskId=${taskId}&programType=SSW`
                );
            });

            it('returns ssw-edit link when updateType is BANK_UPDATE and flag is true', () => {
                const link = buildTaskLink(
                    taskId,
                    caseId,
                    caseType,
                    documentNumber,
                    clientId,
                    SswUpdateOption.BANK_UPDATE,
                    true
                );
                expect(link).toBe(`/ssw-edit/bank-update?taskId=${taskId}`);
            });

            it('returns create-case link when updateType is null', () => {
                const link = buildTaskLink(
                    taskId,
                    caseId,
                    caseType,
                    documentNumber,
                    clientId,
                    null,
                    true
                );
                expect(link).toContain('/create-case/');
            });

            it('returns create-case link when updateType is undefined', () => {
                const link = buildTaskLink(
                    taskId,
                    caseId,
                    caseType,
                    documentNumber,
                    clientId,
                    undefined,
                    true
                );
                expect(link).toContain('/create-case/');
            });
        });
    });

    describe('toFormattedTask', () => {
        const baseTask: Task = {
            id: 'TA000000074601',
            status: 'COMPLETED',
            taskName: 'Data entry',
            userId: 'User One',
            createdDate: '2026-02-06T07:47:14Z',
            updatedDate: '2026-02-06T07:55:15Z',
            taskType: 'SSWFormInputTask',
            updateType: SswUpdateOption.SSW_UPDATE,
        };
        const caseId = 'CA0000603881';
        const caseType = 'SSW';
        const documentNumber = '20260105-EM-093384';
        const clientId = 'NASU';

        it('uses ssw-edit link when sswUpdateReadonlyEnabled is true and task is SSW_UPDATE', () => {
            const result = toFormattedTask(
                mockT,
                baseTask,
                caseId,
                caseType,
                documentNumber,
                clientId,
                true
            );
            expect(result.taskInfoLink).toBe(
                '/ssw-edit/ssw-update?taskId=TA000000074601&programType=SSW'
            );
        });

        it('uses create-case link when sswUpdateReadonlyEnabled is false', () => {
            const result = toFormattedTask(
                mockT,
                baseTask,
                caseId,
                caseType,
                documentNumber,
                clientId,
                false
            );
            expect(result.taskInfoLink).toContain('/create-case/');
            expect(result.taskInfoLink).not.toContain('/ssw-edit/');
        });

        it('uses create-case link when featureFlags is omitted (default false)', () => {
            const result = toFormattedTask(
                mockT,
                baseTask,
                caseId,
                caseType,
                documentNumber,
                clientId
            );
            expect(result.taskInfoLink).toContain('/create-case/');
        });

        it('uses ssw-edit bank-update link when FF on and task updateType is BANK_UPDATE', () => {
            const task = {
                ...baseTask,
                updateType: SswUpdateOption.BANK_UPDATE,
            };
            const result = toFormattedTask(
                mockT,
                task,
                caseId,
                caseType,
                documentNumber,
                clientId,
                true
            );
            expect(result.taskInfoLink).toBe(
                '/ssw-edit/bank-update?taskId=TA000000074601'
            );
        });
    });
});
