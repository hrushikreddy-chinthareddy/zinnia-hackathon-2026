import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { SurrenderState } from '@/components/stepped-workflow/workflows/surrender/provider/types';
import { ApiResponse } from '@/services';
import {
  FullSurrenderBPMResponse,
  getPolicySurrenderValidation,
} from '@/services/bpm/fullsurrender';
import { PolicyRequestInputs } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';
import {
  TransactionFailureResponse,
  TransactionResponse,
} from '@zinnia/api-types/types/bpm';

import { buildFullSurrenderRequestBody } from '../utils';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
): Promise<NextResponse<ApiResponse<FullSurrenderBPMResponse>>> {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildNextReqLoggingContext(_request);

  logTrace('bpm::fullsurrender::validation::POST::start', {
    ...loggingContext,
    planCode: planCode,
    policyNumber: policyNumber,
  });

  try {
    const request: SurrenderState = await _request.json();
    const body = buildFullSurrenderRequestBody(
      request,
      loggingContext.correlationId
    );

    const response = await getPolicySurrenderValidation(
      { planCode, policyNumber },
      body,
      loggingContext
    );

    logTrace('bpm::fullsurrender::validation::POST::complete', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    if (response.data?.status === TransactionResponse.status.SUCCESS) {
      return NextResponse.json({
        data: {
          status: TransactionResponse.status.SUCCESS,
          quoteResponse: response.data.quoteResponse,
        },
        error: null,
      });
    }

    if (response.data?.status === TransactionFailureResponse.status.FAILURE) {
      return NextResponse.json({
        data: {
          status: TransactionResponse.status.FAILURE,
          validationResult: response.data.validationResult,
        },
        error: null,
      });
    }

    throw new Error('Error fetching full surrender validation');
  } catch (error) {
    logError('bpm::fullsurrender::validation::POST::error', {
      ...loggingContext,
      planCode,
      policyNumber,
      error,
    });

    return NextResponse.json({
      data: null,
      error: {
        name: 'bpm::fullsurrender::validation::POST::error',
        message: `error unknown`,
        correlationId: loggingContext.correlationId,
        status: 500,
        cause: error,
      },
    });
  }
}
