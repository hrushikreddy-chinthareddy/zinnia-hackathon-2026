import { NextResponse } from 'next/server';

import { getSession } from '@/utils/auth';
import { optimizelyService } from '@/utils/optimizely/optimizely';

export async function GET() {
  const session = await getSession();
  const featureFlags = await optimizelyService.getFeatureFlagDecisions(
    session?.user.sub || ''
  );

  return NextResponse.json({
    featureFlags,
  });
}
