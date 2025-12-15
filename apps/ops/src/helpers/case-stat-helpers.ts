export const getCaseCompletionDurationStats = (caseObj: {
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
}) => {
    // Convert dates to milliseconds
    const startDateMs = new Date(caseObj.createdAt).getTime();
    const endDateMs = new Date(caseObj.updatedAt).getTime();

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(endDateMs - startDateMs);
    // TODO: append to the object
    return {
        days: differenceMs / (1000 * 60 * 60 * 24),
        hours: differenceMs / (1000 * 60 * 60),
        minutes: differenceMs / (1000 / 60),
        seconds: differenceMs / 1000,
        ms: differenceMs,
    };
};

export const getCaseInProgressDurationStats = (caseObj: {
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
}) => {
    // Convert dates to milliseconds
    const startDateMs = new Date(caseObj.createdAt).getTime();
    const endDateMs = new Date().getTime();

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(endDateMs - startDateMs);
    // TODO: append to the object
    return {
        days: differenceMs / (1000 * 60 * 60 * 24),
        hours: differenceMs / (1000 * 60 * 60),
        minutes: differenceMs / (1000 / 60),
        seconds: differenceMs / 1000,
        ms: differenceMs,
    };
};

export const FNWL_QUALITY_AUDIT_REVIEW_QUEUE_ADMIN =
    'fnwl_quality_audit_review_queue_admin';

export const FNWL_QUALITY_AUDIT_REVIEW_QUEUE_PROCESSOR =
    'fnwl_quality_audit_review_queue_processor';
