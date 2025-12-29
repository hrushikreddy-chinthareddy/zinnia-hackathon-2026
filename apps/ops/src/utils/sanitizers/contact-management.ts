import { ApiError } from 'next/dist/server/api-utils';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { ContactSearchResult } from '@zinnia/api-types/types/contact-management';

import { getErrorMessage } from '../error-utils';
import {
    logErrorWithoutContext,
    parseErrorInformation,
} from '../server-logging';

const toMaskedStringOrUndefined = (
    value: string | null | undefined,
    length?: number
): string | undefined => {
    if (isNullEmptyOrUndefined(value)) {
        return undefined;
    }
    if (length) {
        return new Array(length).fill('*').join('');
    }
    return `${value}`.replace(/./g, '*');
};

export const maskContactManagementSearch = (
    contactSearchResponse: ContactSearchResult
): ContactSearchResult => {
    try {
        const data = contactSearchResponse.data?.map((contact) => {
            const personalInfo = {
                ...contact.personalInfo,
                firstName:
                    toMaskedStringOrUndefined(
                        contact?.personalInfo?.firstName
                    ) || '',
                lastName:
                    toMaskedStringOrUndefined(
                        contact?.personalInfo?.lastName
                    ) || '',
                email:
                    toMaskedStringOrUndefined(contact?.personalInfo?.email) ||
                    '',
                phoneNumber:
                    toMaskedStringOrUndefined(
                        contact?.personalInfo?.phoneNumber
                    ) || '',
                dateOfBirth: toMaskedStringOrUndefined(
                    contact?.personalInfo?.dateOfBirth
                ),
            };
            const address = {
                ...contact.address,
                street1: toMaskedStringOrUndefined(contact?.address?.street1),
                street2: toMaskedStringOrUndefined(contact?.address?.street2),
                city: toMaskedStringOrUndefined(contact?.address?.city),
                state: toMaskedStringOrUndefined(contact?.address?.state),
                zipCode: toMaskedStringOrUndefined(contact?.address?.zipCode),
            };
            return { ...contact, personalInfo, address };
        });
        return { ...contactSearchResponse, data };
    } catch (e) {
        logErrorWithoutContext(
            'sanitizers::maskContactManagementSearch::error',
            {
                ...parseErrorInformation(e),
            }
        );
        throw new ApiError(
            500,
            `maskContactManagementSearch::error masking policySearchResponse: ${getErrorMessage(
                e
            )}`
        );
    }
};
