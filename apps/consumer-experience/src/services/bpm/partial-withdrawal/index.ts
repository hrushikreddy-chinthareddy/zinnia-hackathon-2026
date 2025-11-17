'use server';
import {
  PartialWithdrawalOneTimeRequest,
  TransactionAcceptedResponse,
  TransactionFailureResponse,
  TransactionResponse,
} from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { WithdrawalsState } from '@/components/stepped-workflow/workflows/withdrawals/provider/types';
import { ApiResponse } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { bpmApiBaseUrl, isMockErrorEnabled } from '../../api-config';
import { ServerApi } from '../../server-http';
import {
  transformEligibility,
  withdrawalStateToPolicyRequestInput,
} from '../transformers';

const FILE_NAME = 'src/services/bpm/partial-withdrawal/index.ts';

type PWOTWithdrawalBPMSucessResponse = {
  status: TransactionResponse.status.SUCCESS;
} & TransactionResponse;

type PWOTWithdrawalBPMErrorResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

export type PwotWithdrawalBPMResponse =
  | PWOTWithdrawalBPMSucessResponse
  | PWOTWithdrawalBPMErrorResponse;

type WithdrawalEligibilityResponse = TransactionEligbility;

export type WithdrawalValidationResponse =
  ApiResponse<PwotWithdrawalBPMResponse>;

export type WithdrawalSubmissionResponse =
  ApiResponse<TransactionAcceptedResponse>;

export const submitOneTimeWithdrawal = withLogging<
  [PolicyRequestInputs, WithdrawalsState],
  TransactionAcceptedResponse
>(
  async (
    options: PolicyRequestInputs,
    withdrawalState: WithdrawalsState,
    loggingCtx: CommonLogContext
  ) => {
    const { planCode, policyNumber } = options;
    const body = withdrawalStateToPolicyRequestInput(
      withdrawalState,
      loggingCtx.correlationId
    );

    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/partialwithdrawalonetime`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );
    const response: TransactionAcceptedResponse =
      await parseAPIResponse(rawResponse);

    // We check if the response is not ok or if no caseId is returned
    if (rawResponse.status > 400 || !response.caseId?.length) {
      throw new Error('Error submitting one time withdrawal', {
        cause: await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        }),
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'submitOneTimeWithdrawal',
  }
);

export const getOneTimeWithdrawalEligibility = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<WithdrawalEligibilityResponse> => {
    const { planCode, policyNumber } = options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/partialwithdrawalonetime/eligibilitycheck`;

    if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
      throw new Error('Error fetching withdrawal eligibility.');
    }

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify({ effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT) }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: PwotWithdrawalBPMResponse =
      await parseAPIResponse(rawResponse);

    // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
    if (rawResponse.status > 400) {
      throw new Error('Error fetching withdrawal eligibility', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
        },
      });
    }

    return transformEligibility(response);
  },
  {
    file: FILE_NAME,
    functionName: 'getOneTimeWithdrawalEligibility',
  }
);

export const getOneTimeWithdrawalValidation = withLogging<
  [PolicyRequestInputs, PartialWithdrawalOneTimeRequest],
  PwotWithdrawalBPMResponse
>(
  async (
    options: PolicyRequestInputs,
    pwotRequestDetails: PartialWithdrawalOneTimeRequest,
    loggingCtx: CommonLogContext
  ) => {
    const { planCode, policyNumber } = options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/partialwithdrawalonetime/validation`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(pwotRequestDetails),
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      loggingCtx
    );

    const response: PwotWithdrawalBPMResponse =
      await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400) {
      throw new Error('Error fetching one time withdrawal validation', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
        },
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'getOneTimeWithdrawalValidation',
  }
);
