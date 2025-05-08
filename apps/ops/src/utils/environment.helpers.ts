import { apiServerBaseUrl } from '@deps/queries/api-config';

export enum ENVIRONMENT_URLS {
    PROD = 'https://api.zinnia.io',
    QA = 'https://qa.api.zinnia.io',
    UAT = 'https://uat.api.zinnia.io',
    DEV = 'https://dev.api.zinnia.io',
}

export enum ENVIRONMENT_NAME {
    PROD = 'prod',
    QA = 'qa',
    UAT = 'uat',
    DEV = 'dev',
}

export const environmentUrls: Record<ENVIRONMENT_NAME, ENVIRONMENT_URLS> = {
    [ENVIRONMENT_NAME.PROD]: ENVIRONMENT_URLS.PROD,
    [ENVIRONMENT_NAME.QA]: ENVIRONMENT_URLS.QA,
    [ENVIRONMENT_NAME.UAT]: ENVIRONMENT_URLS.UAT,
    [ENVIRONMENT_NAME.DEV]: ENVIRONMENT_URLS.DEV,
};

// TODO: this and the method below should be changed to use the process.env.NODE_ENV
// changing to process.env.NODE_ENV will require updates to our dockerfile
const prod = environmentUrls[ENVIRONMENT_NAME.PROD];

export const isNonProductionEnvironment = () => {
    const lowerCasedUrl = apiServerBaseUrl?.toLowerCase() || '';

    return lowerCasedUrl !== prod;
};

// Determines if the environment is https (typically non-localhost)
export const isHttpsEnvironment = () => {
    return process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https://');
};

export const isProd = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL === environmentUrls[ENVIRONMENT_NAME.PROD];
};

export const isUat = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL === environmentUrls[ENVIRONMENT_NAME.UAT];
};

export const isQA = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL === environmentUrls[ENVIRONMENT_NAME.QA];
};

export const isDev = () => {
    return process.env.NEXT_PUBLIC_BACKEND_URL === environmentUrls[ENVIRONMENT_NAME.DEV];
};

export const logDataDog = () => {
    return process.env.NEXT_PUBLIC_DATADOG_ENV !== ENVIRONMENT_NAME.DEV;
};

export const isMockAllowed = () => {
    return !isProd() && !isUat();
};
