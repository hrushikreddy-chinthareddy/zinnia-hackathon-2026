import { datadogLogs } from '@datadog/browser-logs';
import { TaxformDownloadResponse } from '@zinnia/api-types/types/documents-v3';
import { AxiosError, AxiosRequestConfig, AxiosResponse, isCancel } from 'axios';

import { DocumentDownloadV2 } from '@deps/models/case/document';
import {
    SearchTaxFormRequestBody,
    SearchTaxFormResponseBody,
} from '@deps/models/case/send-tax-forms';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';

import { baseAppUrl } from '../api-config';

const baseUrl = baseAppUrl + '/api/document/v2/';
const baseUrlV3 = baseAppUrl + '/api/document/v3/';

export const searchTaxForms = async (
    requestBody: SearchTaxFormRequestBody,
    useV3: boolean,
    signal?: AbortSignal
): Promise<ApiResponse<SearchTaxFormResponseBody>> => {
    try {
        let url = `${
            useV3 ? baseUrlV3 + 'tax-forms' : baseUrl + 'taxForms'
        }?contractNumber=${requestBody.contractNumber}&clientCode=${
            requestBody.clientCode
        }`;

        if (requestBody?.numYears) {
            url += `&numYears=${requestBody.numYears}`;
        }
        if (requestBody?.taxYear) {
            url += `&taxYear=${requestBody.taxYear}`;
        }
        // BPB - planCode is only supported on V3
        if (useV3 && requestBody?.planCode) {
            url += `&planCode=${requestBody.planCode}`;
        }

        const options: AxiosRequestConfig = {
            signal,
        };

        datadogLogs.logger.info('searchTaxForms', {
            payload: requestBody,
            url,
            function: 'tax-forms.searchTaxForms',
        });

        const { data } = await client.get<
            SearchTaxFormRequestBody,
            AxiosResponse<SearchTaxFormResponseBody>
        >(url, options);
        return { data, error: null };
    } catch (e) {
        datadogLogs.logger.error('searchTaxForms', {
            payload: requestBody,
            url: `${baseUrl}/taxForms?contractNumber=${requestBody.contractNumber}&numYears=${requestBody.numYears}&clientCode=${requestBody.clientCode}&taxYear=${requestBody.taxYear}`,
            error: e,
            function: 'tax-forms.searchTaxForms',
        });
        if (isCancel(e)) {
            throw new Error('Request was aborted');
        } else {
            console.error('tax-forms::searchTaxForms::error', e);
            return {
                data: {} as SearchTaxFormResponseBody,
                error: {
                    status:
                        (e as AxiosResponse)?.status ||
                        (e as AxiosError)?.response?.status ||
                        500,
                    message:
                        (e as AxiosResponse)?.statusText ||
                        (e as AxiosError)?.response?.statusText ||
                        'Search taxforms error',
                    name: 'Search taxforms error',
                },
            };
        }
    }
};

export const downloadTaxFormById = async (
    formId: number,
    optionalParams: { [key: string]: string } = {},
    useV3: boolean
): Promise<DocumentDownloadV2 | TaxformDownloadResponse> => {
    try {
        if (!formId) {
            throw new Error('No formId provided');
        }

        const queryParams = `?clientCode=${optionalParams?.clientCode}&contractNumber=${optionalParams?.contractNumber}&fChar=${optionalParams?.fChar}&taxYear=${optionalParams?.taxYear}`;

        let url = useV3
            ? `${baseUrlV3}/tax-forms/${formId}/download${queryParams}`
            : `${baseAppUrl}/api/documents/tax-form/${formId}/preview${queryParams}`;

        if (useV3 && optionalParams?.planCode) {
            url += `&planCode=${optionalParams?.planCode}`;
        }

        datadogLogs.logger.info('contactCenterDownloadTaxFormById', {
            payload: { formId, ...optionalParams },
            url,
            function: 'tax-forms.downloadTaxFormById',
        });
        const { data } = await client.get<
            string,
            AxiosResponse<DocumentDownloadV2 | TaxformDownloadResponse>
        >(url);

        return data;
    } catch (e: any) {
        datadogLogs.logger.error('contactCenterDownloadTaxFormById', {
            payload: formId,
            url: `${baseUrl}/forms/${formId}/download`,
            error: e,
            function: 'tax-forms.downloadTaxFormById',
        });
        console.error('tax-forms::contactCenterDownloadTaxFormById::error', e);
        throw new Error(e?.data?.message || 'Error');
    }
};
