import { AxiosResponse } from 'axios';

import { Nigo, OnbaseCase } from '@deps/models/case/case';
import { DigitalFormWithdrawal } from '@deps/models/case/withdrawal/case';
import { CalculateRmdBody, CalculateRmdResponse } from '@deps/models/case/withdrawal/rmd';
import { ProductFund, ProductFundsRequestBody } from '@deps/models/integration/product-funds';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

import { apiServerBaseUrl } from '../api-config';
import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi as serverHttpClient } from '../api-utils/serverApiClient';

const baseUrl = `${baseAppUrl}/api/integration/v1`;
const ssrBaseUrl = `${apiServerBaseUrl}/integration/v1`;

export const getDigitalFormSSR = async (
    accessToken: string,
    queryParams: { contractNumber: string; clientCode: string; source: string; taskType?: string }
): Promise<DigitalFormWithdrawal | null> => {
    try {
        const url = new URL(`${ssrBaseUrl}/digital/form`);
        logInfo('getDigitalFormSSR', { url, queryParams, file: 'queries/api/integration', function: 'getDigitalFormSSR' });
        url.search = new URLSearchParams(queryParams).toString();

        const { data } = await serverHttpClient.get<DigitalFormWithdrawal>(url.href, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return data;
    } catch (error: any) {
        logError('getDigitalFormSSR', {
            ...parseErrorInformation(error),
            queryParams,
            file: 'queries/api/integration',
            function: 'getDigitalFormSSR',
        });
        return null;
    }
};

export const getProductFunds = async ({
    contractNumber,
    clientCode,
    planCode,
    sourceSystem = 'LC',
    expiryDate = '2999-12-31T00:00:00',
}: ProductFundsRequestBody): Promise<ProductFund[] | null> => {
    if (!clientCode) {
        throw new Error('No client code to get product funds for');
    }
    if (!planCode) {
        throw new Error('No plan code to get product funds for');
    }

    try {
        const { data } = await client.post<ProductFundsRequestBody, AxiosResponse<ProductFund[]>>(`${baseUrl}/lifecad/getEligibleFunds`, {
            contractNumber,
            clientCode,
            expiryDate,
            planCode,
            sourceSystem,
        });

        return data;
    } catch (e) {
        console.error('Error fetching product funds', e);
        return null;
    }
};

export const calculateRmd = async (query: CalculateRmdBody, policyNumber: string, clientCode: string): Promise<CalculateRmdResponse> => {
    try {
        const response = await client.post<CalculateRmdBody, AxiosResponse>(
            `${baseUrl}/${clientCode}/rmd/${policyNumber}/calculate`,
            query
        );
        return response.data;
    } catch (error: any) {
        console.error('calculate RMD::An error occurred retrieving calculate RMD response', error);
        throw new Error(error?.data?.status?.statusMessage || 'An error occurred retrieving calculate RMD response');
    }
};

export const getOnbaseCaseDetailsSSR = async (lob: string, caseId: string, accessToken: string | undefined): Promise< Promise<OnbaseCase | null>> => {
    try {
        const url = `${ssrBaseUrl}/onbase/getCaseDetails`;
        const formData = {
            lob,
            caseId
        };
        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        };

        logInfo('getOnbaseCaseDetailsSSR', { file: 'queries/api/cases', function: 'getOnbaseCaseDetailsSSR', url, formData });
        const { data } = await serverHttpClient.post<any, AxiosResponse>(url, formData, config);
        return data;
    } catch (error: any) {
        logError('getOnbaseCaseDetailsSSR', {
            ...parseErrorInformation(error),
            lob,
            caseId,
            file: 'queries/api/integration',
            function: 'getOnbaseCaseDetailsSSR'
        });
        return null;
    }
}

export const checkNigoExistsSSR = async (lob: string, caseId: string, accessToken: string | undefined): Promise<boolean> => {
    try {
        const caseDetails = await getOnbaseCaseDetailsSSR(lob, caseId, accessToken as string);
        const nigoExists = caseDetails?.nigos?.some((nigo: Nigo) => nigo?.status.toUpperCase() === 'NEW') || false;
        logInfo('checkNigoExistsSSR', { file: 'queries/api/integration', function: 'checkNigoExistsSSR', lob, caseId, nigoExists });
        return nigoExists;
    } catch (error: any) {
        logError('checkNigoExistsSSR', {
            ...parseErrorInformation(error),
            lob,
            caseId,
            file: 'queries/api/integration',
            function: 'checkNigoExistsSSR',
        });
        return false;
    }
};