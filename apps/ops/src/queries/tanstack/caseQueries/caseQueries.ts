import { Statuses } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';
import { getCaseCallLogs } from '@deps/queries/api/contracts';

export const getCasesQuery = async (policyNumber?: string) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }

    const response = await getCases({
        limit: 5,
        notInCaseStatus: [Statuses.Canceled, Statuses.Completed],
        policyNumber,
    });

    if (!response) {
        throw 'No data in response';
    }

    return response;
};

export const getCallLogsQuery = async (policyNumber?: string, limit = 10) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }

    const results = await getCaseCallLogs({ contract: policyNumber, offset: 0, limit });

    return {
        data: results?.data?.items || [],
        status: results?.status,
    };
};
