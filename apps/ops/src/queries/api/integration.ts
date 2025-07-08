import { AxiosResponse } from 'axios';

import { Nigo, OnbaseCase } from '@deps/models/case/case';
import { DigitalFormWithdrawal } from '@deps/models/case/withdrawal/case';
import {
    CalculateRmdBody,
    CalculateRmdResponse,
} from '@deps/models/case/withdrawal/rmd';
import {
    ProductFund,
    ProductFundsRequestBody,
} from '@deps/models/integration/product-funds';
import { browserLogInfo } from '@deps/utils/browser-logging';
import {
    logError,
    LoggingContext,
    logInfo,
    parseErrorInformation,
} from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi as serverHttpClient } from '../api-utils/serverApiClient';

const baseUrl = `${baseAppUrl}/api/integration/v1`;
const ssrBaseUrl = `${apiServerBaseUrl}/integration/v1`;

export const getDigitalFormSSR = async (
    accessToken: string,
    queryParams: {
        contractNumber: string;
        clientCode: string;
        source: string;
        taskType?: string;
    },
    logCtx: LoggingContext
): Promise<DigitalFormWithdrawal | null> => {
    const loggingContext = {
        ...logCtx,
        inputs: { queryParams },
        file: 'queries/api/integration',
        function: 'getDigitalFormSSR',
    };
    try {
        const url = new URL(`${ssrBaseUrl}/digital/form`);
        logInfo('getDigitalFormSSR', {
            ...loggingContext,
            url: url.toString(),
        });
        url.search = new URLSearchParams(queryParams).toString();

        const { data } = await serverHttpClient.get<DigitalFormWithdrawal>(
            url.href,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        logError('getDigitalFormSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
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
        const { data } = await client.post<
            ProductFundsRequestBody,
            AxiosResponse<ProductFund[]>
        >(`${baseUrl}/lifecad/getEligibleFunds`, {
            contractNumber,
            clientCode,
            expiryDate,
            planCode,
            sourceSystem,
        });
        console.log('Retrieved prouct funds', data);
        return data;
    } catch (e) {
        console.error('Error fetching product funds', e);
        return null;
    }
};

export const calculateRmd = async (
    query: CalculateRmdBody,
    policyNumber: string,
    clientCode: string
): Promise<CalculateRmdResponse> => {
    try {
        const response = await client.post<CalculateRmdBody, AxiosResponse>(
            `${baseUrl}/${clientCode}/rmd/${policyNumber}/calculate`,
            query
        );
        return response.data;
    } catch (error: any) {
        console.error(
            'calculate RMD::An error occurred retrieving calculate RMD response',
            error
        );
        throw new Error(
            error?.data?.status?.statusMessage ||
                'An error occurred retrieving calculate RMD response'
        );
    }
};

export const getOnbaseCaseDetailsSSR = async (
    lob: string,
    caseId: string,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<Promise<OnbaseCase | null>> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/integration',
        function: 'getOnbaseCaseDetailsSSR',
        inputs: { lob, caseId },
    };
    try {
        const url = `${ssrBaseUrl}/onbase/getCaseDetails`;
        const formData = {
            lob,
            caseId,
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

        logInfo('getOnbaseCaseDetailsSSR', loggingContext);
        const { data } = await serverHttpClient.post<any, AxiosResponse>(
            url,
            formData,
            config,
            loggingContext
        );
        return data;
    } catch (error: any) {
        logError('getOnbaseCaseDetailsSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return null;
    }
};

export const checkNigoExistsSSR = async (
    lob: string,
    caseId: string,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<boolean> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/integration',
        function: 'checkNigoExistsSSR',
        inputs: { lob, caseId },
    };
    try {
        const caseDetails = await getOnbaseCaseDetailsSSR(
            lob,
            caseId,
            accessToken as string,
            loggingContext
        );
        const nigoExists =
            caseDetails?.nigos?.some(
                (nigo: Nigo) => nigo?.status.toUpperCase() === 'NEW'
            ) || false;
        logInfo('checkNigoExistsSSR', { ...loggingContext, nigoExists });
        return nigoExists;
    } catch (error: any) {
        logError('checkNigoExistsSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return false;
    }
};

export const getDocuments = async (
    lob: string,
    docType: string,
    contractNumber: string
): Promise<any> => {
    if (!lob) {
        throw new Error('No lob provided');
    }
    if (!docType) {
        throw new Error('No doc type provided');
    }
    if (!contractNumber) {
        throw new Error('No contract number provided');
    }
    const body = {
        lob,
        docType,
        contractNumber,
    };

    try {
        const { data } = await client.post<any, AxiosResponse>(
            `${baseUrl}/onbase/getdocuments`,
            body
        );

        browserLogInfo('getDocuments::success', {
            payload: body,
            totalDocumets: data.data?.length || 0,
            function: 'integration.getDocuments',
        });
        return data.data || [];
    } catch (error) {
        browserLogInfo('getDocuments::error', {
            ...parseErrorInformation(error),
            payload: body,
            function: 'integration.getDocuments',
        });

        return [];
    }
};
