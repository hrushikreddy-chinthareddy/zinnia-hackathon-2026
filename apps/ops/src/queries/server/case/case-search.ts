import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CaseSearchBody, CaseSearchResponse } from '@deps/types/search';
import { caseSanitizer, fullyMaskCase } from '@deps/utils/sanitizers';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import canUnmaskPii from '../fga/can-unmask';
const caseSearch = async ({
    accessToken,
    body,
    loggingContext,
    partyId,
}: {
    accessToken: string;
    body: CaseSearchBody;
    loggingContext?: object;
    partyId?: string;
}) => {
    try {
        const canUnmask = await canUnmaskPii(accessToken, partyId, loggingContext);

        const caseSearchResult = (await serverApi.post(
            `${apiServerBaseUrl}/case/v1/cases/search`,
            body,
            { authorization: 'Bearer ' + accessToken },
            loggingContext
        )) as AxiosResponse<CaseSearchResponse>;
        if ('total' in caseSearchResult.data) {
            const maskedData = caseSearchResult.data.data.map(caseData => {
                return canUnmask ? caseSanitizer(caseData) : fullyMaskCase(caseData);
            });
            return { ...caseSearchResult.data, data: maskedData };
        } else {
            return null;
        }
    } catch (e) {
        logWarn('case-search::caseSearch', { ...parseErrorInformation(e) });
    }
};

export default caseSearch;
