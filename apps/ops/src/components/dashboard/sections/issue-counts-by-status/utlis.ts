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
