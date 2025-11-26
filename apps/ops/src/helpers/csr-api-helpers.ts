import { AxiosResponse } from 'axios';

import { ApiProps } from '@deps/models/case/task';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import {
    browserLogError,
    browserLogInfo,
    browserLogWarn,
} from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { sortByAndThenBy } from './sort.helpers';
import { replacePlaceholders } from './value-placement.helpers';
const baseUrl = baseAppUrl + '/api/';

export function parseJsonValue(value: string) {
    if (
        typeof value === 'string' &&
        ((value.startsWith('{') && value.endsWith('}')) ||
            (value.startsWith('[') && value.endsWith(']')))
    ) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    if (typeof value === 'string' && (value === 'true' || value === 'false')) {
        return value === 'true';
    }
    return value;
}

export function isString(v: unknown) {
    return typeof v === 'string';
}

export const stringifyObjectValue = (v: unknown) => {
    // Only stringify if the value is an object
    if (v !== null && typeof v === 'object') {
        return JSON.stringify(
            Object.keys(v)
                .sort()
                .reduce<Record<string, unknown>>((acc, key) => {
                    acc[key] = v[key as keyof typeof v];
                    return acc;
                }, {})
        );
    }
    if (v !== null && typeof v === 'boolean') {
        return String(v);
    }
    return v;
};

function deduplicate<T>(items: T[]): T[] {
    const seen = new Map<string, T>();

    for (const item of items) {
        const key =
            typeof item === 'object' && item !== null
                ? JSON.stringify(item)
                : String(item);

        if (!seen.has(key)) {
            seen.set(key, item);
        }
    }

    return Array.from(seen.values());
}

export const csrApiHelper = async (
    props: ApiProps,
    formData: any,
    strigify = false
) => {
    const { apiUrl, apiMethod, apiPayload, responseData, response, sorted } =
        props;
    browserLogInfo('csrApiHelper:: fetching data', {
        apiUrl,
        apiMethod,
        apiPayload,
        responseData,
        response,
        strigify,
    });

    if (apiMethod === 'post') {
        try {
            const payload = replacePlaceholders(apiPayload, formData);
            const url = replacePlaceholders(apiUrl, formData);
            const { data } = await client.post<any, AxiosResponse<any>>(
                `${baseUrl}${url}`,
                payload
            );
            const filteredApiData = responseData
                ? replacePlaceholders(responseData, data)
                : data;

            if (response) {
                let filteredResponse: any = filteredApiData;
                if (typeof filteredApiData == 'string') {
                    try {
                        const parsedData = parseJsonValue(filteredApiData);
                        filteredResponse = parsedData.filter(Boolean);
                    } catch (e) {
                        filteredResponse = filteredApiData;
                        browserLogWarn('Error parsing JSON:', {
                            data: filteredApiData,
                            e,
                        });
                    }
                }

                const mapDataToKeys: Record<string, any> = {};

                Object.keys(response).forEach((key) => {
                    const values =
                        filteredResponse?.map((item: any) => {
                            const filteredItem = item[(response as any)?.[key]];
                            return filteredItem ? filteredItem : item;
                        }) || [];

                    mapDataToKeys[key] = deduplicate(values);
                });
                return mapDataToKeys;
            }

            return filteredApiData;
        } catch (error) {
            browserLogError(
                'csrApiHelper::Error occurred while fetching post api data',
                {
                    ...parseErrorInformation(error),
                    apiUrl,
                    apiMethod,
                    apiPayload,
                    responseData,
                    response,
                    strigify,
                }
            );
            return error;
        }
    }

    if (apiMethod === 'get') {
        try {
            const queryString = new URLSearchParams(
                replacePlaceholders(apiPayload, formData)
            ).toString();
            const url = replacePlaceholders(apiUrl, formData);
            const dataUrl = url + (queryString ?? '');
            const { data } = await client.get<any, AxiosResponse<any>>(
                `${baseUrl}${dataUrl}`
            );
            const filteredApiData = responseData
                ? replacePlaceholders(responseData, data)
                : data;

            const sortedData = sorted
                ? sortByAndThenBy(filteredApiData, response?.enum || '')
                : filteredApiData;

            if (response) {
                const mapDataToKeys: Record<string, any> = {};
                Object.keys(response).forEach((key) => {
                    const values =
                        sortedData?.map((item: any) => {
                            const filteredItem = item[(response as any)?.[key]];
                            return filteredItem ? filteredItem : item;
                        }) || [];

                    mapDataToKeys[key] = values;
                });

                return mapDataToKeys;
            }
            return filteredApiData;
        } catch (error) {
            browserLogError(
                'csrApiHelper:: Error occurred while fetching get api data',
                {
                    ...parseErrorInformation(error),
                    apiUrl,
                    apiMethod,
                    apiPayload,
                    responseData,
                    response,
                    strigify,
                }
            );
            return error;
        }
    }
};
