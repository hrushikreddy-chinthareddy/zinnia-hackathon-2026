import { apiServerBaseUrl } from '@deps/queries/api-config';

export enum ENVIRONMENT_URLS {
    PROD = 'https://api.zinnia.io',
    QA = 'https://qa.api.zinnia.io',
    UAT = 'https://uat.api.zinnia.io',
    DEV = 'https://dev.api.zinnia.io',
    DEMO = 'https://dev.api.zinnia.io/demo',
    FARMERS_TRAINING = 'https://dev.api.zinnia.io/farmers-training',
}

export enum ENVIRONMENT_NAME {
    PROD = 'prod',
    QA = 'qa',
    UAT = 'uat',
    DEV = 'dev',
    DEMO = 'demo',
    FARMERS_TRAINING = 'farmers-training',
}

export const environmentUrls: Record<ENVIRONMENT_NAME, ENVIRONMENT_URLS> = {
    [ENVIRONMENT_NAME.PROD]: ENVIRONMENT_URLS.PROD,
    [ENVIRONMENT_NAME.QA]: ENVIRONMENT_URLS.QA,
    [ENVIRONMENT_NAME.UAT]: ENVIRONMENT_URLS.UAT,
    [ENVIRONMENT_NAME.DEV]: ENVIRONMENT_URLS.DEV,
    [ENVIRONMENT_NAME.DEMO]: ENVIRONMENT_URLS.DEMO,
    [ENVIRONMENT_NAME.FARMERS_TRAINING]: ENVIRONMENT_URLS.FARMERS_TRAINING,
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
    return (
        process.env.NEXT_PUBLIC_BACKEND_URL ===
        environmentUrls[ENVIRONMENT_NAME.PROD]
    );
};

export const isDemo = () => {
    const nonDemoEnvs = [
        ENVIRONMENT_NAME.PROD,
        ENVIRONMENT_NAME.QA,
        ENVIRONMENT_NAME.UAT,
        ENVIRONMENT_NAME.DEV,
    ];

    const currentBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Check if the current URL is NOT in the list of production environment URLs
    return !nonDemoEnvs.some(
        (env) => environmentUrls[env] === currentBackendUrl
    );
};

export const isEvglDemo = () => {
    return (
        process.env.NEXT_PUBLIC_BACKEND_URL ===
        environmentUrls[ENVIRONMENT_NAME.DEMO]
    );
};

export const isFarmersTraining = () => {
    return (
        process.env.NEXT_PUBLIC_BACKEND_URL ===
        environmentUrls[ENVIRONMENT_NAME.FARMERS_TRAINING]
    );
};

export const isUat = () => {
    return (
        process.env.NEXT_PUBLIC_BACKEND_URL ===
        environmentUrls[ENVIRONMENT_NAME.UAT]
    );
};

export const isQA = () => {
    return (
        process.env.NEXT_PUBLIC_BACKEND_URL ===
        environmentUrls[ENVIRONMENT_NAME.QA]
    );
};

export const isDev = () => {
    return (
        process.env.NEXT_PUBLIC_BACKEND_URL ===
        environmentUrls[ENVIRONMENT_NAME.DEV]
    );
};

export const logDataDog = () => {
    return process.env.NEXT_PUBLIC_DATADOG_ENV !== ENVIRONMENT_NAME.DEV;
};

export const isMockAllowed = () => {
    return !isProd() && !isUat();
};
