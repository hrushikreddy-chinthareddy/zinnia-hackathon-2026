import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';

import { lineOfBusinessUrlPath } from './data';
import { COOKIE_DOMAIN } from '../../constants';

export const prependSubdomain = (subdomain: string): string => {
  let protocol = 'https';
  let domain = COOKIE_DOMAIN;
  if (domain?.includes('local')) {
    domain = `${domain}:3000`;
    protocol = 'http';
  }
  return `${protocol}://${subdomain}.${domain}`;
};

/**
 * Returns a subdomain based on x-forwarded-host.
 * @param requestHeaders
 * @returns
 */
export const getSubdomain = (requestHeaders: Headers) => {
  return requestHeaders?.get('x-forwarded-host')?.split('.')[0];
};

export const getPolicyDataFromPath = (pathname: string) => {
  const urlParts = pathname.split('/');
  const lineOfBusiness = urlParts[2] ?? '';
  const planCode = urlParts[3] ?? '';
  const policyNumber = urlParts[4] ?? '';
  const lineOfBusinessUrl = lineOfBusinessUrlPath(
    lineOfBusiness as LineOfBusiness
  );

  return {
    lineOfBusiness,
    lineOfBusinessUrl,
    planCode,
    policyNumber,
  };
};
