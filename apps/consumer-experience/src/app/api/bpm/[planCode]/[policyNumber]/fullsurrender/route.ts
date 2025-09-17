import { NextRequest, NextResponse } from 'next/server';

import { SurrenderState } from '@/components/providers/surrender/types';
import {
  FullSurrenderSubmissionResponse,
  submitFullSurrender,
} from '@/services/bpm/fullsurrender';
import { PolicyRequestInputsParams } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

import { buildFullSurrenderRequestBody } from './utils';

export async function POST(
  _request: NextRequest,
  { params }: PolicyRequestInputsParams
): Promise<NextResponse<FullSurrenderSubmissionResponse>> {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('bpm::onetimepremium::POST::start', {
    ...loggingContext,
    planCode: planCode,
    policyNumber: policyNumber,
  });

  try {
    const state: SurrenderState = await _request.json();
    const request = buildFullSurrenderRequestBody(
      state,
      loggingContext.correlationId
    );

    const response = await submitFullSurrender(
      { planCode, policyNumber },
      request,
      loggingContext
    );

    logTrace('bpm::fullsurrender::POST::complete', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    if (response.data?.data?.caseId?.length) {
      return NextResponse.json({
        status: 202,
        data: response.data.data,
        error: null,
      });
    }

    throw new Error('Error submitting full surrender');
  } catch (error) {
    logError('bpm::fullsurrender::POST::error', {
      ...loggingContext,
      planCode,
      policyNumber,
      error,
    });

    return NextResponse.json({
      data: null,
      error: {
        status: 500,
        name: 'Error submitting full surrender',
        message: `error submitting full surrender`,
        correlationId: loggingContext.correlationId,
      },
    });
  }
}
