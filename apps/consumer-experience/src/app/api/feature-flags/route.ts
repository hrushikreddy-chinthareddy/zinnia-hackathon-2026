'use server';
import { NextRequest, NextResponse } from 'next/server';

import { ApiResponse } from '@/services';
import { getSession } from '@/utils/auth';
import { logInfo } from '@/utils/logging/log-fns';
import { FeatureFlags, optimizelyService } from '@/utils/optimizely/optimizely';

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<FeatureFlags>>> {
  const session = await getSession();
  const { headers, url: reqUrl } = req;

  // TODO: Remove this log
  logInfo('getFeatureFlagQuery', {
    headers,
    reqUrl,
    protocol: new URL(reqUrl).protocol,
    host: headers.get('x-forwarded-host'),
    envValue: process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW,
    envValueNextPublic:
      process.env.NEXT_PUBLIC_AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW,
  });
  const featureFlags = await optimizelyService.getFeatureFlagDecisions(
    session?.user.sub || ''
  );

  if (!featureFlags) {
    return NextResponse.json({
      data: null,
      error: {
        name: 'Feature Flag Error',
        status: 500,
        message: 'Failed to get feature flags',
      },
    });
  }

  return NextResponse.json({
    data: featureFlags,
    error: null,
  });
}
