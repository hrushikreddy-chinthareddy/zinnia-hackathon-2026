import { datadogLogs } from '@datadog/browser-logs';
import { AxiosRequestConfig, AxiosResponse, isCancel } from 'axios';

import { SearchTaxFormRequestBody, SearchTaxFormResponseBody } from '@deps/models/case/send-tax-forms';
import { client } from '@deps/queries/api-utils/client';

import { baseAppUrl } from '../api-config';

const baseUrl = baseAppUrl + '/api/document/v2/';

export const searchTaxForms = async (requestBody: SearchTaxFormRequestBody, signal?: AbortSignal): Promise<SearchTaxFormResponseBody> => {
    try {
        let url = `${baseUrl}taxForms?contractNumber=${requestBody.contractNumber}&clientCode=${requestBody.clientCode}`;

        if (requestBody?.numYears) {
            url += `&numYears=${requestBody.numYears}`;
        }
        if (requestBody?.taxYear) {
            url += `&taxYear=${requestBody.taxYear}`;
        }

        const options: AxiosRequestConfig = {
            signal,
        };

        datadogLogs.logger.info('contactCenterSearchTaxForms', {
            payload: requestBody,
            url,
            function: 'tax-forms.searchTaxForms',
        });

        const { data } = await client.get<SearchTaxFormRequestBody, AxiosResponse<SearchTaxFormResponseBody>>(url, options);
        return data;
    } catch (e) {
        datadogLogs.logger.error('contactCenterSearchTaxForms', {
            payload: requestBody,
            url: `${baseUrl}/taxForms?contractNumber=${requestBody.contractNumber}&numYears=${requestBody.numYears}&clientCode=${requestBody.clientCode}&taxYear=${requestBody.taxYear}`,
            error: e,
            function: 'tax-forms.searchTaxForms',
        });
        if (isCancel(e)) {
            throw new Error('Request was aborted');
        } else {
            console.error('tax-forms::contactCenterSearchTaxForms::error', e);
            return {} as SearchTaxFormResponseBody;
        }
    }
};

export const downloadTaxFormById = async (formId: number, optionalParams: { [key: string]: string } = {}): Promise<any> => {
    try {
        if (!formId) {
            throw new Error('No formId provided');
        }
        const url = `${baseAppUrl}/api/documents/tax-form/${formId}/preview?clientCode=${optionalParams?.clientCode}&contractNumber=${optionalParams?.contractNumber}&fChar=${optionalParams?.fChar}&taxYear=${optionalParams?.taxYear}`;

        datadogLogs.logger.info('contactCenterDownloadTaxFormById', {
            payload: { formId, ...optionalParams },
            url,
            function: 'tax-forms.downloadTaxFormById',
        });
        const { data } = await client.get<string, AxiosResponse<any>>(url);

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
