import { AxiosResponse } from 'axios';

import { ApiProps } from '@deps/models/case/task';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogWarn } from '@deps/utils/browser-logging';

import { replacePlaceholders } from './value-placement.helpers';
const baseUrl = baseAppUrl + '/api/';

export function parseJsonValue(value: string) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

export function isString(v: unknown) {
    return typeof v === 'string';
}

export const stringifyValue = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));

function deduplicate<T>(items: T[]): T[] {
    const seen = new Map<string, T>();

    for (const item of items) {
        const key = typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item);

        if (!seen.has(key)) {
            seen.set(key, item);
        }
    }

    return Array.from(seen.values());
}

export const csrApiHelper = async (props: ApiProps, formData: any, strigify = false) => {
    const { apiUrl, apiMethod, apiPayload, responseData, response } = props;

    if (apiMethod === 'post') {
        try {
            const payload = replacePlaceholders(apiPayload, formData);
            const url = replacePlaceholders(apiUrl, formData);
            const { data } = await client.post<any, AxiosResponse<any>>(`${baseUrl}${url}`, payload);
            const filteredApiData = responseData ? replacePlaceholders(responseData, data) : data;

            if (response) {
                let filteredResponse: any = filteredApiData;
                if (typeof filteredApiData == 'string') {
                    try {
                        const parsedData = parseJsonValue(filteredApiData);
                        filteredResponse = parsedData.filter(Boolean);
                    } catch (e) {
                        filteredResponse = filteredApiData;
                        browserLogWarn('Error parsing JSON:', { data: filteredApiData, e });
                    }
                }

                const mapDataToKeys: Record<string, any> = {};

                Object.keys(response).forEach(key => {
                    const values =
                        filteredResponse?.map((item: any) => {
                            const filteredItem = item[(response as any)?.[key]];
                            return filteredItem ? filteredItem : strigify ? stringifyValue(item) : item;
                        }) || [];

                    mapDataToKeys[key] = deduplicate(values);
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
            const url = replacePlaceholders(apiUrl, formData);
            const dataUrl = url + (queryString ?? '');
            const { data } = await client.get<any, AxiosResponse<any>>(`${baseUrl}${dataUrl}`);
            const filteredApiData = responseData ? replacePlaceholders(responseData, data) : data;

            if (response) {
                const mapDataToKeys: Record<string, any> = {};
                Object.keys(response).forEach(key => {
                    mapDataToKeys[key] = filteredApiData?.map((item: any) => {
                        const filteredItem = item[(response as any)?.[key]];
                        return filteredItem ? filteredItem : strigify ? stringifyValue(item) : item;
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
