import { NextRequest, NextResponse } from 'next/server';

import { getPolicyProfileData } from '@/services';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const { data, error } = await getPolicyProfileData({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  if (error) {
    return NextResponse.json({
      error,
    });
  }

  return NextResponse.json({
    data,
  });
}
