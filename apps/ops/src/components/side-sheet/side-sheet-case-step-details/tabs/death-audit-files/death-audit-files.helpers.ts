import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    AuditDetailsResponse,
    DeathAuditFileTypes,
    DeathAuditSummaryItem,
    AuditSummaryItem,
    DeathAuditCaseFileTypes,
    AuditFileItem,
    AuditFile,
} from './death-audit-files.types';

export const getDetails = (
    details: any,
    prop: string,
    key: string
): AuditDetailsResponse => {
    switch (prop) {
        case DeathAuditFileTypes.OUTBOUND: {
            const totalRecordCount =
                details?.entity?.outbound?.totalRecordCount;
            return {
                files: details?.entity?.outbound?.files ?? [],
                summary: [
                    {
                        label: 'deathAuditFiles.summary.totalRecordsSent',
                        value: totalRecordCount ?? DEFAULT_ERROR_STRING,
                    },
                ],
            };
        }
        case DeathAuditFileTypes.INBOUND: {
            const summary = details?.entity?.inbound?.summary ?? {};
            const keySummary = !isNullEmptyOrUndefined(key)
                ? getSummaryByKey(summary, key)
                : [];
            return {
                files: details?.entity?.inbound?.files ?? [],
                summary: keySummary ?? [],
            };
        }
        default: {
            return {
                files: [],
                summary: [],
            };
        }
    }
};

export const getSummaryByKey = (
    summary: DeathAuditSummaryItem,
    key: string
): AuditSummaryItem[] => {
    switch (key) {
        case DeathAuditCaseFileTypes.MATCHED_CASES_FILE:
            return [
                {
                    label: 'deathAuditFiles.summary.totalHits',
                    value: summary?.totalRecordCount ?? DEFAULT_ERROR_STRING,
                },
                {
                    label: 'deathAuditFiles.summary.existingCaseMatches',
                    value: summary?.existingCaseCount ?? DEFAULT_ERROR_STRING,
                },
                {
                    label: 'deathAuditFiles.summary.newCases',
                    value: summary?.newCaseCount ?? DEFAULT_ERROR_STRING,
                },
            ];
        case DeathAuditCaseFileTypes.CANCELLED_CASES_FILE: {
            return [
                {
                    label: 'deathAuditFiles.summary.totalHits',
                    value: summary?.totalRecordCount ?? DEFAULT_ERROR_STRING,
                },
                {
                    label: 'deathAuditFiles.summary.cancelledCaseMatches',
                    value:
                        summary?.cancelledRecordCount ?? DEFAULT_ERROR_STRING,
                },
            ];
        }
        case DeathAuditCaseFileTypes.INBOUND_CASES_FILE: {
            return [
                {
                    label: 'deathAuditFiles.summary.totalHits',
                    value: summary?.totalRecordCount ?? DEFAULT_ERROR_STRING,
                },
            ];
        }
        default: {
            return [];
        }
    }
};
export const getFileSection = (
    fileItem: any,
    prop: string,
    key: string
): AuditFile | null => {
    switch (prop) {
        case DeathAuditFileTypes.OUTBOUND: {
            return fileItem || null;
        }
        case DeathAuditFileTypes.INBOUND: {
            return fileItem?.[key as keyof AuditFileItem] || null;
        }
        default:
            return null;
    }
};
