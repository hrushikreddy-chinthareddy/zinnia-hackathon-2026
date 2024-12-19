import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { caseSanitizer, fullyMaskCase } from '@deps/utils/sanitizers';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import canUnmaskPii from '../fga/can-unmask';
const getCase = async ({
    accessToken,
    caseId,
    loggingContext,
    partyId,
}: {
    accessToken: string;
    caseId: string;
    loggingContext?: object;
    partyId?: string;
}) => {
    try {
        const canUnmask = await canUnmaskPii(accessToken, partyId, loggingContext);

        const getCaseResponse = await serverApi.get(
            `${apiServerBaseUrl}/case/v1/cases/${caseId}`,
            { authorization: 'Bearer ' + accessToken },
            loggingContext
        );
        const maskedData = canUnmask ? caseSanitizer(getCaseResponse.data) : fullyMaskCase(getCaseResponse.data);

        return { ...getCaseResponse, data: maskedData };
    } catch (e) {
        logWarn('get-case::getCase', { ...parseErrorInformation(e) });
        return {
            status: 500,
            data: null,
        };
    }
};

export default getCase;
