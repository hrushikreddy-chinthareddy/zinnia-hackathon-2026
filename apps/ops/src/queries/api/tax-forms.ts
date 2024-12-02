import { datadogLogs } from '@datadog/browser-logs';
import { AxiosResponse } from 'axios';

import { SearchTaxFormRequestBody, SearchTaxFormResponseBody } from '@deps/models/case/send-tax-forms';
import { client } from '@deps/queries/api-utils/client';

import { baseAppUrl } from '../api-config';

const baseUrl = baseAppUrl + '/api/document/v2/';

export const searchTaxForms = async (requestBody: SearchTaxFormRequestBody): Promise<SearchTaxFormResponseBody> => {
    try {
        let url = `${baseUrl}taxForms?contractNumber=${requestBody.contractNumber}&clientCode=${requestBody.clientCode}`;

        if (requestBody?.numYears) {
            url += `&numYears=${requestBody.numYears}`;
        }
        if (requestBody?.taxYear) {
            url += `&taxYear=${requestBody.taxYear}`;
        }

        datadogLogs.logger.info('contactCenterSearchTaxForms', {
            payload: requestBody,
            url,
            function: 'searchTaxForms.searchTaxForms',
        });

        const { data } = await client.get<SearchTaxFormRequestBody, AxiosResponse<SearchTaxFormResponseBody>>(url);
        return data;
    } catch (e) {
        datadogLogs.logger.error('contactCenterSearchTaxForms', {
            payload: requestBody,
            url: `${baseUrl}/taxForms?contractNumber=${requestBody.contractNumber}&numYears=${requestBody.numYears}&clientCode=${requestBody.clientCode}&taxYear=${requestBody.taxYear}`,
            error: e,
            function: 'searchTaxForms.searchTaxForms',
        });
        console.error('searchTaxForms::contactCenterSearchTaxForms::error', e);
        return {} as SearchTaxFormResponseBody;
    }
};

export const downloadTaxFormById = async (formId: number): Promise<string | null> => {
    try {
        if (!formId) {
            throw new Error('No formId provided');
        }
        datadogLogs.logger.info('contactCenterDownloadTaxFormById', {
            payload: formId,
            url: `${baseUrl}/forms/${formId}/download`,
            function: 'searchTaxForms.downloadTaxFormById',
        });
        const { data } = await client.get<string, AxiosResponse<string>>(`${baseUrl}/forms/${formId}/download`);

        return data;
    } catch (e: any) {
        datadogLogs.logger.error('contactCenterDownloadTaxFormById', {
            payload: formId,
            url: `${baseUrl}/forms/${formId}/download`,
            error: e,
            function: 'searchTaxForms.downloadTaxFormById',
        });
        console.error('searchTaxForms::contactCenterDownloadTaxFormById::error', e);
        throw new Error(e?.data?.message || 'Error');
    }
};
