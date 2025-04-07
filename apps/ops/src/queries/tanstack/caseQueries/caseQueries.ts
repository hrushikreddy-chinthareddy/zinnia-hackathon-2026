import { Statuses } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';

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
