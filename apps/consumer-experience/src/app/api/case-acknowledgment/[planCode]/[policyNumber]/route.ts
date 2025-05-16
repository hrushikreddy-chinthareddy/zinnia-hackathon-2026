import { NextResponse } from 'next/server';

import {
  acknowledgeCase,
  AcknowledgeCaseDTO,
  fetchAcknowledgedCases,
} from '@/services/terms-and-conditions';

export async function GET(
  _request: Request,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const { planCode, policyNumber } = params;

  const response = await fetchAcknowledgedCases({
    planCode,
    policyNumber,
  });

  return NextResponse.json(response);
}

export async function POST(_request: Request) {
  const body: AcknowledgeCaseDTO = await _request.json();
  const response = await acknowledgeCase(body);

  return NextResponse.json(response);
}
