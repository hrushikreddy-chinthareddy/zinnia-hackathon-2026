import { AxiosResponse } from 'axios';

import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { Address } from '@zinnia/api-types/types/sor';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

const baseUrl = baseAppUrl + '/api/validation/v1';
const newbaseUrl = baseAppUrl + '/api/communication/v1';

export const validateAddress = async (
    clientCode: string,
    address: Address,
    useSpectrumApi: boolean
): Promise<any> => {
    let url;
    try {
        if (!clientCode) {
            throw new Error('no client provided');
        }
        if (isEmptyObject(address)) {
            throw new Error('no address provided');
        }

        if (useSpectrumApi) {
            url = `${newbaseUrl}/${clientCode.toLowerCase()}/addressvalidation`;
        } else {
            url = `${baseUrl}/${clientCode.toLowerCase()}/addressvalidation`;
        }

        const { data } = await client.post<any, AxiosResponse>(url, address);
        if (!data.AddressValidationResponse) {
            throw new Error('Address validation API error');
        }
        browserLogInfo('Successfully validated address', {
            file: 'queries/api/validateAddress',
            function: 'validateAddress',
            useSpectrumApi,
            url,
        });
        return data.AddressValidationResponse;
    } catch (e) {
        browserLogError('An error occurred while validating address', {
            file: 'queries/api/validateAddress',
            function: 'validateAddress',
            clientCode,
            address,
            useSpectrumApi,
            url,
        });
        return null;
    }
};
