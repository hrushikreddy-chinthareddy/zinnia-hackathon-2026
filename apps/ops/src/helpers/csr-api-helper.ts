import { AxiosResponse } from 'axios';

import { ApiProps } from '@deps/models/case/task';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';

import { replacePlaceholders } from './value-placement.helper';
const baseUrl = baseAppUrl + '/api/';
export const csrApiHelper = async (props: ApiProps, formData: any) => {
    const { apiUrl, apiMethod, apiBody, apiHeaders, apiPayload, responseData, response } = props;

    if (apiMethod === 'post') {
        try {
            const payload = replacePlaceholders(apiPayload, formData);
            const { data } = await client.post<any, AxiosResponse<any>>(`${baseUrl}${apiUrl}`, payload);
            const filteredApiData = responseData ? replacePlaceholders(responseData, data) : data;

            if (response) {
                const mapDataToKeys: Record<string, any> = {};
                Object.keys(response).forEach(key => {
                    mapDataToKeys[key] = filteredApiData?.map((item: any) => {
                        return item[(response as any)?.[key]] != undefined ? item[(response as any)?.[key]] : item;
                    });
                });
                return mapDataToKeys;
            }

            return filteredApiData;
        } catch (error) {
            return error;
        }
    }

    if (apiMethod === 'get') {
        try {
            const queryString = new URLSearchParams(replacePlaceholders(apiPayload, formData)).toString();
            const url = queryString ? apiUrl + queryString : apiUrl;
            const { data } = await client.get<any, AxiosResponse<any>>(`${baseUrl}${url}`);
            const filteredApiData = responseData ? replacePlaceholders(responseData, data) : data;

            if (response) {
                const mapDataToKeys: Record<string, any> = {};
                Object.keys(response).forEach(key => {
                    mapDataToKeys[key] = filteredApiData?.map((item: any) => {
                        return item[(response as any)?.[key]] != undefined ? item[(response as any)?.[key]] : item;
                    });
                });
                return mapDataToKeys;
            }
            return filteredApiData;
        } catch (error) {
            return error;
        }
    }
};
