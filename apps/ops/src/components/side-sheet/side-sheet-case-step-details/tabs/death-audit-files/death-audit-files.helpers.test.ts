import '@testing-library/jest-dom';

// Mock external deps to keep tests self-contained
jest.mock('@deps/helpers/string.helpers', () => ({
    isNullEmptyOrUndefined: (v: unknown) =>
        v === null || v === undefined || v === '',
}));

jest.mock('@deps/types/constants', () => ({
    DEFAULT_ERROR_STRING: 'N/A',
}));

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    getDetails,
    getSummaryByKey,
    getFileSection,
} from './death-audit-files.helpers';
import {
    DeathAuditFileTypes,
    DeathAuditCaseFileTypes,
    AuditFileItem,
} from './death-audit-files.types';

describe('##death-audit-files.helpers', () => {
    describe('#getDetails - OUTBOUND', () => {
        it('#returns outbound files and summary with totalRecordsSent', () => {
            const details = {
                entity: {
                    outbound: {
                        totalRecordCount: 7,
                        files: [
                            { documentId: 'd1', fileName: 'o1.csv' },
                            { documentId: 'd2', fileName: 'o2.csv' },
                        ],
                    },
                },
            };

            const res = getDetails(
                details as any,
                DeathAuditFileTypes.OUTBOUND,
                ''
            );

            expect(res.files).toHaveLength(2);
            expect(res.files[0]).toMatchObject({
                documentId: 'd1',
                fileName: 'o1.csv',
            });
            expect(res.summary).toEqual([
                {
                    label: 'deathAuditFiles.summary.totalRecordsSent',
                    value: 7,
                },
            ]);
        });

        it('#falls back to DEFAULT_ERROR_STRING when totalRecordCount is missing', () => {
            const details = {
                entity: {
                    outbound: {
                        files: [],
                    },
                },
            };

            const res = getDetails(
                details as any,
                DeathAuditFileTypes.OUTBOUND,
                ''
            );

            expect(res.files).toEqual([]);
            expect(res.summary).toEqual([
                {
                    label: 'deathAuditFiles.summary.totalRecordsSent',
                    value: DEFAULT_ERROR_STRING,
                },
            ]);
        });
    });

    describe('##getDetails - INBOUND', () => {
        const makeInboundItem = (
            partial: Partial<AuditFileItem>
        ): AuditFileItem => ({
            file: { documentId: 'doc', fileName: 'f.csv' },
            matchedCasesFile: { documentId: 'm', fileName: 'm.csv' },
            cancelledCasesFile: { documentId: 'c', fileName: 'c.csv' },
            inboundCasesFile: { documentId: 'i', fileName: 'i.csv' },
            summary: {
                totalRecordCount: 0,
                cancelledRecordCount: 0,
                existingCaseCount: 0,
                newCaseCount: 0,
            },
            ...partial,
        });

        it('#aggregates inbound summary for MATCHED_CASES_FILE', () => {
            const details = {
                entity: {
                    inbound: {
                        files: [
                            makeInboundItem({
                                summary: {
                                    totalRecordCount: 5,
                                    existingCaseCount: 2,
                                    newCaseCount: 3,
                                    cancelledRecordCount: 1,
                                },
                            }),
                            makeInboundItem({
                                summary: {
                                    totalRecordCount: 7,
                                    existingCaseCount: 4,
                                    newCaseCount: 1,
                                    cancelledRecordCount: 0,
                                },
                            }),
                        ],
                    },
                },
            };

            const res = getDetails(
                details as any,
                DeathAuditFileTypes.INBOUND,
                DeathAuditCaseFileTypes.MATCHED_CASES_FILE
            );

            expect(res.files).toHaveLength(2);
            expect(res.summary).toEqual([
                { label: 'deathAuditFiles.summary.totalHits', value: 12 },
                {
                    label: 'deathAuditFiles.summary.existingCaseMatches',
                    value: 6,
                },
                { label: 'deathAuditFiles.summary.newCases', value: 4 },
            ]);
        });

        it('#aggregates inbound summary for CANCELLED_CASES_FILE', () => {
            const details = {
                entity: {
                    inbound: {
                        files: [
                            makeInboundItem({
                                summary: {
                                    totalRecordCount: 2,
                                    cancelledRecordCount: 2,
                                },
                            }),
                            makeInboundItem({
                                summary: {
                                    totalRecordCount: 8,
                                    cancelledRecordCount: 3,
                                },
                            }),
                        ],
                    },
                },
            };

            const res = getDetails(
                details as any,
                DeathAuditFileTypes.INBOUND,
                DeathAuditCaseFileTypes.CANCELLED_CASES_FILE
            );

            expect(res.summary).toEqual([
                { label: 'deathAuditFiles.summary.totalHits', value: 10 },
                {
                    label: 'deathAuditFiles.summary.cancelledCaseMatches',
                    value: 5,
                },
            ]);
        });

        it('#aggregates inbound summary for INBOUND_CASES_FILE', () => {
            const details = {
                entity: {
                    inbound: {
                        files: [
                            makeInboundItem({
                                summary: { totalRecordCount: 1 },
                            }),
                            makeInboundItem({
                                summary: { totalRecordCount: 9 },
                            }),
                        ],
                    },
                },
            };

            const res = getDetails(
                details as any,
                DeathAuditFileTypes.INBOUND,
                DeathAuditCaseFileTypes.INBOUND_CASES_FILE
            );

            expect(res.summary).toEqual([
                { label: 'deathAuditFiles.summary.totalHits', value: 10 },
            ]);
        });

        it('#returns empty summary when key is null/empty (isNullEmptyOrUndefined true)', () => {
            const details = { entity: { inbound: { files: [] } } };

            // key = '' will be considered empty by our mock of isNullEmptyOrUndefined
            const res = getDetails(
                details as any,
                DeathAuditFileTypes.INBOUND,
                ''
            );

            expect(res.files).toEqual([]);
            expect(res.summary).toEqual([]);
        });
    });

    describe('##getDetails - default', () => {
        it('#returns empty files and summary for unknown prop', () => {
            const res = getDetails({}, 'unknown', 'any');
            expect(res).toEqual({ files: [], summary: [] });
        });
    });

    describe('##getSummaryByKey', () => {
        it('#produces matched cases summary with fallbacks', () => {
            const summary = {
                totalRecordCount: undefined as any,
                existingCaseCount: undefined as any,
                newCaseCount: undefined as any,
            };
            const res = getSummaryByKey(
                summary as any,
                DeathAuditCaseFileTypes.MATCHED_CASES_FILE
            );
            expect(res).toEqual([
                {
                    label: 'deathAuditFiles.summary.totalHits',
                    value: DEFAULT_ERROR_STRING,
                },
                {
                    label: 'deathAuditFiles.summary.existingCaseMatches',
                    value: DEFAULT_ERROR_STRING,
                },
                {
                    label: 'deathAuditFiles.summary.newCases',
                    value: DEFAULT_ERROR_STRING,
                },
            ]);
        });

        it('#produces cancelled cases summary with fallbacks', () => {
            const summary = {
                totalRecordCount: undefined as any,
                cancelledRecordCount: undefined as any,
            };
            const res = getSummaryByKey(
                summary as any,
                DeathAuditCaseFileTypes.CANCELLED_CASES_FILE
            );
            expect(res).toEqual([
                {
                    label: 'deathAuditFiles.summary.totalHits',
                    value: DEFAULT_ERROR_STRING,
                },
                {
                    label: 'deathAuditFiles.summary.cancelledCaseMatches',
                    value: DEFAULT_ERROR_STRING,
                },
            ]);
        });

        it('#produces inbound cases summary with fallbacks', () => {
            const summary = { totalRecordCount: undefined as any };
            const res = getSummaryByKey(
                summary as any,
                DeathAuditCaseFileTypes.INBOUND_CASES_FILE
            );
            expect(res).toEqual([
                {
                    label: 'deathAuditFiles.summary.totalHits',
                    value: DEFAULT_ERROR_STRING,
                },
            ]);
        });

        it('#returns empty array for unknown key', () => {
            const summary = { totalRecordCount: 1 };
            const res = getSummaryByKey(summary as any, 'unknown-key');
            expect(res).toEqual([]);
        });
    });

    describe('getFileSection', () => {
        it('#returns file item as-is for OUTBOUND', () => {
            const item = { documentId: 'x', fileName: 'out.csv' };
            expect(
                getFileSection(
                    item as any,
                    DeathAuditFileTypes.OUTBOUND,
                    'ignored'
                )
            ).toEqual(item);
            expect(
                getFileSection(
                    undefined as any,
                    DeathAuditFileTypes.OUTBOUND,
                    'ignored'
                )
            ).toBeNull();
        });

        it('#returns nested by key for INBOUND or null when missing', () => {
            const item = {
                matchedCasesFile: { documentId: 'm1', fileName: 'm.csv' },
            };
            expect(
                getFileSection(
                    item as any,
                    DeathAuditFileTypes.INBOUND,
                    DeathAuditCaseFileTypes.MATCHED_CASES_FILE
                )
            ).toEqual(item.matchedCasesFile);
            expect(
                getFileSection(
                    item as any,
                    DeathAuditFileTypes.INBOUND,
                    DeathAuditCaseFileTypes.CANCELLED_CASES_FILE
                )
            ).toBeNull();
        });

        it('returns null for unknown prop', () => {
            expect(getFileSection({} as any, 'unknown', 'k')).toBeNull();
        });
    });
});
