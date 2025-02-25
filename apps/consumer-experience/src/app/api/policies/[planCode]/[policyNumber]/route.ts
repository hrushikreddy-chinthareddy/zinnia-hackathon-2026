import { NextRequest, NextResponse } from 'next/server';

import { getPolicyDetails } from '@/services';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const { data, error } = await getPolicyDetails({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
