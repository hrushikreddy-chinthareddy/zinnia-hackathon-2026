import { NextRequest, NextResponse } from 'next/server';

import {
  acknowledgeCase,
  AcknowledgeCaseDTO,
  fetchAcknowledgedCases,
} from '@/services/terms-and-conditions';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const { planCode, policyNumber } = params;
  const commonLogContext = await buildNextReqLoggingContext(_request);

  const response = await fetchAcknowledgedCases(
    {
      planCode,
      policyNumber,
    },
    commonLogContext
  );

  return NextResponse.json(response);
}

export async function POST(_request: NextRequest) {
  const commonLogContext = await buildNextReqLoggingContext(_request);

  const body: AcknowledgeCaseDTO = await _request.json();
  const response = await acknowledgeCase(body, commonLogContext);

  return NextResponse.json(response);
}
