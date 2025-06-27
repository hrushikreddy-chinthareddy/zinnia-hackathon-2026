import { getCookie } from 'cookies-next';

import { isMockAllowed } from '@deps/utils/environment.helpers';

const getMockParam = () => {
    return getCookie('..mock..') as string;
};

// const getMockErrorParam = () => {
//     const cookieStore = cookies();

//     return cookieStore.get('..mock_error..')?.value;
// };

//   export const isMockErrorEnabled = (endpoint: ApiEndpoints) => {
//     if (!isMockAllowed()) {
//       return false;
//     }

//     const mockErrorVals = getMockErrorParam();

//     if (!mockErrorVals) {
//       return false;
//     }

//     return JSON.parse(mockErrorVals).includes(endpoint);
//   };

// ..mock..=on = mock all
export const isMockAllRequestEnabled = (val?: boolean) => {
    if (!isMockAllowed()) {
        return false;
    }

    if (val !== undefined) {
        return val;
    }

    return (
        getMockParam() === 'on' ||
        process.env.NEXT_PUBLIC_MOCK_API_REQUEST === 'true'
    );
};

// ..mock..=policySearch
export const isMockPolicySearchRequestEnabled = () => {
    if (!isMockAllowed()) {
        return false;
    }

    return (
        getMockParam()?.includes('policySearch') || isMockAllRequestEnabled()
    );
};

// ..mock..=policyDetails
export const isMockPolicyDetailsRequestEnabled = () => {
    if (!isMockAllowed()) {
        return false;
    }

    return (
        getMockParam()?.includes('policyDetails') || isMockAllRequestEnabled()
    );
};

export const isMockPolicyDocsRequestEnabled = () => {
    if (!isMockAllowed()) {
        return false;
    }

    return getMockParam()?.includes('policyDocs') || isMockAllRequestEnabled();
};

export const isMockCaseDetailsRequestEnabled = () => {
    if (!isMockAllowed()) {
        return false;
    }

    return getMockParam()?.includes('caseDetails') || isMockAllRequestEnabled();
};

export const isMockCorrespondanceDocsRequestEnabled = () => {
    if (!isMockAllowed()) {
        return false;
    }

    return (
        getMockParam()?.includes('correspondanceDocs') ||
        isMockAllRequestEnabled()
    );
};
