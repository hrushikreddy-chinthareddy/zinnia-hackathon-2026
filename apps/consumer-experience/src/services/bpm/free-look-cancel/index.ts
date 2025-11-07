'use server';
import {
  FreeLookCancellationRequest,
  TransactionAcceptedResponse,
  TransactionFailureResponse,
  TransactionResponse,
} from '@xd/api-types/dist/generated-types/bpm';
import dayjs from 'dayjs';

import { transactionApiBaseUrl } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { ApiResponse } from '@/services/types';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { transformEligibility } from '../transformers';

const FILE_NAME = 'bpm/freelook-cancellation/index.ts';

type FreeLookCancellationEligibilityResponse =
  | TransactionFailureResponse
  | Pick<TransactionResponse, 'status'>;

export type FreeLookCancellationBPMResponse =
  | TransactionAcceptedResponse
  | TransactionFailureResponse;

export type FreeLookCancellationSubmissionResponse =
  ApiResponse<FreeLookCancellationBPMResponse>;

export type FreeLookCancellationBPMRequest = FreeLookCancellationRequest;

export const getFreeLookCancellationEligibility = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<TransactionEligbility> => {
    const { planCode, policyNumber } = options;
    const url = `${transactionApiBaseUrl}/${planCode}/${policyNumber}/freelookcancellation/eligibilitycheck`;

    const body = {
      effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
      correlationId: loggingCtx.correlationId,
    };

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: FreeLookCancellationEligibilityResponse =
      await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400) {
      throw new Error('Error fetching free look cancellation eligibility', {
        cause: await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        }),
        ...loggingCtx,
      });
    }

    return transformEligibility(response);
  },
  {
    file: FILE_NAME,
    functionName: 'getFreeLookCancellationEligibility',
  }
);

export const submitFreeLookCancellation = withLogging(
  async (
    { planCode, policyNumber }: PolicyRequestInputs,
    requestBody: FreeLookCancellationRequest,
    loggingCtx: CommonLogContext
  ): Promise<FreeLookCancellationBPMResponse> => {
    const url = `${transactionApiBaseUrl}/${planCode}/${policyNumber}/freelookcancellation`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(requestBody),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: FreeLookCancellationBPMResponse =
      await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400 || 'caseId' in response === false) {
      throw new Error('Error submitting one time premium payment', {
        cause: await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        }),
        ...loggingCtx,
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'submitFreeLookCancellation',
  }
);
