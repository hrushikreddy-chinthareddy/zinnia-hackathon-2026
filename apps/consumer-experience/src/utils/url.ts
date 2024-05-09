import { headers } from 'next/headers';

import { AppUrl } from '@/types';

/**
 * if a user logs in via a client landing page or requests the site from a carrier subdomain we need to redirect to the parent domain after login
 * For example: if a user logs in via everly.zinniatech.com we redirec to zinniatech.com
 * however, we also need to account for various environment like dev, qa, and uat
 * in the case of logging in through a test environment we want to ensure we redirect to the environment url.
 * for example: is a user logs in via everly.qa.zinniatech.com we redirect to qa.zinniatech.com
 * @param path Optional Relative path
 * @returns AppUrl
 */
export const appUrl = (path?: string): AppUrl => {
  const headerStore = headers();
  const host = headerStore.get('host');
  const isLocalhost = host?.includes('.local') || host?.includes('localhost');
  const port = isLocalhost ? host?.split(':')?.pop() ?? '' : '';
  const protocol = isLocalhost ? 'http:' : 'https:';
  const hostParts = host?.split(':')[0]?.split('.');
  const firstSubdomain = hostParts?.[0] ?? '';
  // currently our preview environments are hosted in Vercel and we don't have proper subdomains
  // so if the host includes Vercel we know we aren't in a carrier context
  const isCarrierRequest =
    !['dev', 'qa', 'uat', 'zinniatech', 'localhost'].includes(firstSubdomain) &&
    !hostParts?.includes('vercel');
  let domain: string | undefined;

  if (isCarrierRequest) {
    // we need to remove the carrier from the app domain
    domain = hostParts?.splice(1).join('.');
  } else {
    domain = hostParts?.join('.');
  }

  return {
    host,
    carrier: isCarrierRequest ? firstSubdomain : '',
    isCarrierRequest,
    domain,
    protocol,
    port,
    href: `${protocol}//${domain}:${port}${path ?? ''}`,
  };
};
