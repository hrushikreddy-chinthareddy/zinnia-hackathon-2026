import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { FreeLookCancelState } from '@/components/stepped-workflow/workflows/free-look-cancel/provider/types';
import {
  FreeLookCancellationBPMRequest,
  FreeLookCancellationBPMResponse,
  submitFreeLookCancellation,
} from '@/services/bpm/free-look-cancel';
import { ApiResponse } from '@/services/types';
import { PolicyRequestInputsParams } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

import { buildFreeLookCancellationRequestBody } from './utils';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  { params }: PolicyRequestInputsParams
): Promise<NextResponse<ApiResponse<FreeLookCancellationBPMResponse>>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('bpm::freelookcancellation::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  const state: FreeLookCancelState = await _request.json();

  const requestBody: FreeLookCancellationBPMRequest =
    buildFreeLookCancellationRequestBody(state, loggingContext.correlationId);

  const response = await submitFreeLookCancellation(
    { planCode, policyNumber },
    requestBody,
    { user: loggingContext.user, correlationId: loggingContext.correlationId }
  );

  logTrace('bpm::freelookcancellation::POST::complete', {
    ...loggingContext,
    planCode,
    policyNumber,
  });

  return NextResponse.json(response);
}
