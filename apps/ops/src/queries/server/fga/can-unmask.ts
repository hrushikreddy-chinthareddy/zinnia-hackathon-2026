import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CheckTupleResponse } from '@deps/types/fga';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import { AxiosResponse } from 'axios';

// This is a simplified hotfix to check if a user is either operations and can see unmask pii OR they are advisors excel, who can see pii.  Other solutions are rate-limited and failing in production.
const canUnmaskPii = async (accessToken: string | undefined, partyId: string | undefined, loggingContext?: object) => {
    try {
        const fgaBaseUrl = `${apiServerBaseUrl}/fga/v1`;
        const listCarriersRequest = serverApi.post<any, AxiosResponse>(
            `${fgaBaseUrl}/list-carriers`,
            { user: `party:${partyId}`, relation: 'unmask_pii' },
            { authorization: 'Bearer ' + accessToken },
            loggingContext
        );
        const advisorsExcelRequest = serverApi.post<any, AxiosResponse<CheckTupleResponse>>(
            `${fgaBaseUrl}/check`,
            { user: `party:${partyId}`, relation: 'party', object: 'role:advisors_excel_imo_support' },
            { authorization: 'Bearer ' + accessToken },
            loggingContext
        );

        const [unmaskingCarriers, isAdvisorsExcel] = await Promise.allSettled([listCarriersRequest, advisorsExcelRequest]);

        console.log('BPB - unmaskingcarriers', unmaskingCarriers?.value?.data?.carriers);
        if (unmaskingCarriers.status !== 'fulfilled' && isAdvisorsExcel.status !== 'fulfilled') {
            logWarn('fga/can-unmask::canUnmaskPii: error getting unmasking carriers', {
                ...parseErrorInformation(unmaskingCarriers.reason),
                loggingContext,
            });
            return false;
        }

        if (unmaskingCarriers.status === 'fulfilled' && unmaskingCarriers.value?.data?.carriers?.length > 0) {
            return true;
        } else if (isAdvisorsExcel.status === 'fulfilled' && isAdvisorsExcel.value?.data?.allowed) {
            return true;
        }
        return false;
    } catch (e) {
        logWarn('fga/can-unmask::canUnmaskPii', { ...parseErrorInformation(e), loggingContext });
        return false;
    }
};

export default canUnmaskPii;
