import { Reason } from '@deps/containers/task-container/task-handlers/types';

const isMismatchCategory = (category?: string) =>
    !!category && category.toLowerCase().includes('mismatch');

export const getIssueResolvedLabel = (
    issueResolved: boolean | undefined
): string => {
    if (issueResolved === true) return 'Yes';
    if (issueResolved === false) return 'No, the document has some issue(s)';
    return '-';
};

export const categorizeReasons = (declineReasons: Reason[]) =>
    declineReasons.reduce<{
        missingReasons: Reason[];
        mismatchedReasons: Reason[];
    }>(
        (acc, reason) => {
            if (isMismatchCategory(reason.category)) {
                acc.mismatchedReasons.push(reason);
            } else {
                acc.missingReasons.push(reason);
            }
            return acc;
        },
        { missingReasons: [], mismatchedReasons: [] }
    );
