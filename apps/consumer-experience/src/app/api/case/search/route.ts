import { NextRequest, NextResponse } from 'next/server';

import { searchCasesByPolicyNumber } from '@/services/case';

export async function POST(_request: NextRequest) {
  const { policyNumber, carrierCode } = await _request.json();
  const { data, error } = await searchCasesByPolicyNumber({
    policyNumber,
    carrierCode
  });

  return NextResponse.json({
    data,
    error,
  });
}
