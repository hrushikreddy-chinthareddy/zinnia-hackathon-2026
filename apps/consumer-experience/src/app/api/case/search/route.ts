import { NextRequest, NextResponse } from 'next/server';

import { searchCasesByPolicyNumber } from '@/services/case';

export async function POST(_request: NextRequest) {
  const { policyNumber } = await _request.json();
  const { data, error } = await searchCasesByPolicyNumber({
    policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
