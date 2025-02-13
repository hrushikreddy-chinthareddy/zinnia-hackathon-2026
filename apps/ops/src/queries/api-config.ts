export const apiVersion = 'v1';

// We need to default to empty string because the latest versions of node treat empty variables as undefined
// this variable is empty in Vercel builds so we can use the Preview environments
export const baseAppUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
export const apiServerBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
export const apiServerUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${apiVersion}`;
export const se2ApiServerUrl = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/case/${apiVersion}`;
export const AUDIENCE = process.env.NEXT_PUBLIC_SE2_BACKEND_URL;
export const policyApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/policy/${apiVersion}/policies`;
export const integrationApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/integration/${apiVersion}`;
export const calculatorApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/rmd-calculation/${apiVersion}`;
export const se2ApiServerUrlV2 = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/case/v2`;
export const contactCenterBaseUrlV2 = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/c2web/v2`;
export const fundsApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/funds/${apiVersion}`;
export const dataApiBaseUrl = `${process.env.NEXT_PUBLIC_DATA_API_BASE_URL ?? ''}`;
