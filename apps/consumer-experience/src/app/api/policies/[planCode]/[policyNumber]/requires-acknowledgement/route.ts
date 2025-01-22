import { NextRequest, NextResponse } from 'next/server';

import { checkResetDeliveryDateEligibility } from '@/services/bpm';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const { data, error } = await checkResetDeliveryDateEligibility({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
