import { AxiosResponse } from 'axios';
import { get } from 'lodash';

const clientCaseErrorMap = {
    100: 'We got an unknown error.',
    200: "We couldn't find the agency carrier at this time",
    201: 'We couldn’t load the agency details at this time.',
    300: "We couldn't find the user details at this time.",
    301: "We couldn't load producer details at this time.",
    302: "We couldn't check the client case access for this user at this time",
} as const;

export const parseClientCaseError = (response: AxiosResponse) => {
    const { data, status } = response;

    if (status === 400) {
        return 'One or more valiation errors ocurred';
    }

    if ('errorCode' in data) {
        const errorMessage =
            get(clientCaseErrorMap, data.errorCode) || clientCaseErrorMap[100];
        return `${errorMessage} Please try again later.`;
    }

    return `${clientCaseErrorMap[100]} Please try again later.`;
};
