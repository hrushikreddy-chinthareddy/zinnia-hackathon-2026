import { Address } from '@zinnia/api-types/types/sor';
import { AxiosResponse } from 'axios';

import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

const baseUrl = baseAppUrl + '/api/validation/v1';

export const validateAddress = async (
    clientCode: string,
    address: Address
): Promise<any> => {
    try {
        if (!clientCode) {
            throw new Error('no client provided');
        }
        if (isEmptyObject(address)) {
            throw new Error('no address provided');
        }
        const url = `${baseUrl}/${clientCode.toLowerCase()}/addressvalidation`;
        const { data } = await client.post<any, AxiosResponse>(url, address);
        if (!data.AddressValidationResponse) {
            throw new Error('Address validation API error');
        }
        browserLogInfo('Successfully validated address', {
            file: 'queries/api/validateAddress',
            function: 'validateAddress',
        });
        return data.AddressValidationResponse;
    } catch (e) {
        browserLogError('An error occurred while validating address', {
            file: 'queries/api/validateAddress',
            function: 'validateAddress',
            clientCode,
            address,
        });
        return null;
    }
};
