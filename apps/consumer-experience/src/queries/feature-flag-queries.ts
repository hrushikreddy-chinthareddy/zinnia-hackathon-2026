import { NextRequest } from 'next/server';

import { logInfo } from '@/utils/logging/server-logging';

export const getFeatureFlagQuery = async (req?: NextRequest) => {
  const headers = req?.headers;
  const reqUrl = req?.url || '';
  const protocol = new URL(reqUrl).protocol || '';
  const host = headers?.get('x-forwarded-host') || '';
  const envValue = process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW;
  const envValueNextPublic =
    process.env.NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW;
  logInfo('getFeatureFlagQuery', {
    headers,
    reqUrl,
    protocol,
    host,
    envValue,
    envValueNextPublic,
  });
  const fetchUrl = `${protocol ? protocol + '//' : ''}${host}/api/feature-flags`;

  const featureFlagDecisions = await fetch(fetchUrl);
  const { featureFlags } = await featureFlagDecisions.json();
  return featureFlags;
};

export const getSessionQuery = async (req?: NextRequest) => {
  const headers = req?.headers;
  const reqUrl = req?.url || '';
  const protocol = new URL(reqUrl).protocol || '';
  const host = headers?.get('x-forwarded-host') || '';
  const envValue = process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW;
  const envValueNextPublic =
    process.env.NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW;
  logInfo('getSessionQuery', {
    headers,
    reqUrl,
    protocol,
    host,
    envValue,
    envValueNextPublic,
  });
  const fetchUrl = `${protocol ? protocol + '//' : ''}${host}/api/session`;
  const session = await fetch(fetchUrl);
  const { isActiveSession } = await session.json();
  return isActiveSession;
};
