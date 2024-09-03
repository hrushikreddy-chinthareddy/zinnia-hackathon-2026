import { NextRequest, NextResponse } from 'next/server';

import { getPolicyStatusDetails } from '@/services';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const { data, error } = await getPolicyStatusDetails({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
