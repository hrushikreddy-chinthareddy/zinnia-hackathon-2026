import { NextResponse } from 'next/server';

import { getSession } from '@/utils/auth';
import { getFeatureFlagDecisions } from '@/utils/optimizely/optimizely';

export async function GET() {
  const session = await getSession();
  const featureFlags = await getFeatureFlagDecisions(session?.user.sub);

  return NextResponse.json({
    featureFlags,
  });
}
