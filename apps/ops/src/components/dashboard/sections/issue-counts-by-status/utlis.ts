import { ExceptionStatus } from '@deps/queries/tanstack/dashboard/types';

import { ExceptionStatusMappingType } from './context/issue-counts-by-status-context';

export const exceptionStatusMapping: ExceptionStatusMappingType = {
    [ExceptionStatus.UNRESOLVED]: [
        ExceptionStatus.UNRESOLVED,
        ExceptionStatus.INPROGRESS,
        ExceptionStatus.IN_PROGRESS,
        ExceptionStatus.NEW,
    ],
    [ExceptionStatus.RESOLVED]: [ExceptionStatus.RESOLVED],
};
export function getIssueStatusText(
    exceptionStatus: ExceptionStatus[] | undefined
) {
    if (!exceptionStatus || exceptionStatus.length === 0) return 'Issues';

    const includesUnresolved = exceptionStatus.includes(
        ExceptionStatus.UNRESOLVED
    );
    const includesResolved = exceptionStatus.includes(ExceptionStatus.RESOLVED);

    if (includesUnresolved && includesResolved) return 'Issues';
    if (includesUnresolved) return `${ExceptionStatus.UNRESOLVED} issues`;
    if (includesResolved) return `${ExceptionStatus.RESOLVED} issues`;

    // Fallback in case unexpected values appear
    return 'Issues';
}
