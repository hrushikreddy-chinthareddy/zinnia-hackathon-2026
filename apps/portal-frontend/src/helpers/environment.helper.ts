import { apiServerBaseUrl } from '@deps/queries/api-config';

export enum ENVIRONMENTS {
    PROD = 'prod',
    QA = 'qa',
    DEV = 'dev',
}

// TODO: this and the method below should be changed to use the process.env.NODE_ENV
// changing to process.env.NODE_ENV will require updates to our dockerfile
const prod = 'https://api.zinnia.io';

export const isNonProductionEnvironment = () => {
    const lowerCasedUrl = apiServerBaseUrl?.toLowerCase() || '';

    return lowerCasedUrl !== prod;
};
