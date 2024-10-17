import { NextRequest } from 'next/server';

export const getFeatureFlagQuery = async (req?: NextRequest) => {
  const headers = req?.headers;
  const reqUrl = req?.url || '';
  const protocol = new URL(reqUrl).protocol || '';
  const host = headers?.get('x-forwarded-host') || '';
  const fetchUrl = `${protocol ? protocol + '//' : ''}${host}/api/feature-flags`;

  const featureFlagDecisions = await fetch(fetchUrl);
  const { featureFlags } = await featureFlagDecisions.json();
  return featureFlags;
};
