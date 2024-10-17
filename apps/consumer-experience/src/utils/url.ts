import { headers } from 'next/headers';

export const prependSubdomain = (subdomain: string): string => {
  let protocol = 'https';
  let domain =
    process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW ||
    process.env.AUTH0_COOKIE_DOMAIN ||
    process.env.VERCEL_BRANCH_URL;
  if (domain?.includes('local')) {
    domain = `${domain}:3000`;
    protocol = 'http';
  }
  return `${protocol}://${subdomain}.${domain}`;
};

/**
 *
 * @returns true if the url is running on vercel
 */
export const isVercelEnvironment = () => {
  const headersList = headers();
  const url = headersList.get('host') || '';

  return url.includes('vercel.app');
};

/**
 * Returns a subdomain based on x-forwarded-host.
 * @param requestHeaders
 * @returns
 */
export const getSubdomain = (requestHeaders: Headers) => {
  return requestHeaders.get('x-forwarded-host')?.split('.')[0];
};

export const getPolicyDataFromPath = (pathname: string) => {
  const urlParts = pathname.split('/');
  const lineOfBusiness = urlParts[2] ?? '';
  const planCode = urlParts[3] ?? '';
  const policyNumber = urlParts[4] ?? '';

  return {
    lineOfBusiness,
    planCode,
    policyNumber,
  };
};
