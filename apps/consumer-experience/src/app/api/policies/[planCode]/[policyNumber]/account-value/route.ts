import { NextRequest, NextResponse } from 'next/server';

import { getPolicyAccountValueWith30DayChange } from '@/services';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const { data, error } = await getPolicyAccountValueWith30DayChange({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  console.log(data);

  return NextResponse.json({
    data,
    error,
  });
}
