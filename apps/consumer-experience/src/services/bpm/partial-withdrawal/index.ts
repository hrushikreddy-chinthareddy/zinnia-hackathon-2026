'use server';
import {
  PartialWithdrawalOneTimeRequest,
  TransactionAcceptedResponse,
  TransactionFailureResponse,
  TransactionResponse,
} from '@xd/api-types/dist/generated-types/bpm';
import dayjs from 'dayjs';
import { CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH } from 'next/dist/shared/lib/constants';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import { ApiResponse } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError, logTrace, logWarn } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { bpmApiBaseUrl, isMockErrorEnabled } from '../../api-config';
import { ServerApi } from '../../server-http';
import {
  transformEligibility,
  withdrawalStateToPolicyRequestInput,
} from '../transformers';

const FILE_NAME = 'bpm/index.ts';

type PWOTWithdrawalBPMSucessResponse = {
  status: TransactionResponse.status.SUCCESS;
} & TransactionResponse;

type PWOTWithdrawalBPMErrorResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

type PwotWithdrawalBPMResponse =
  | PWOTWithdrawalBPMSucessResponse
  | PWOTWithdrawalBPMErrorResponse;

type WithdrawalEligibilityResponse = ApiResponse<TransactionEligbility>;

export type WithdrawalValidationResposne =
  ApiResponse<PwotWithdrawalBPMResponse>;

export type WithdrawalSubmissionResponse =
  ApiResponse<TransactionAcceptedResponse>;

export const submitOneTimeWithdrawal = withLogging<
  [PolicyRequestInputs, WithdrawalsState],
  WithdrawalSubmissionResponse
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

    try {
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

      if (response.caseId?.length) {
        return {
          data: response,
          error: null,
        };
      }

      throw new Error('Error submitting one time withdrawal');
    } catch (error) {
      logError('Error submitting one time withdrawal', { error });
      return {
        data: null,
        error: {
          status: 500,
          name: 'Error submitting one time withdrawal',
          message: 'error submitting one time withdrawal',
        },
      };
    }
  },
  {
    file: FILE_NAME,
    functionName: 'submitOneTimeWithdrawal',
  }
);

export const getOneTimeWithdrawalEligibility = withLogging<
  [PolicyRequestInputs],
  PwotWithdrawalBPMResponse
>(
  async (options: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
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
      logError(
        'Error fetching withdrawal eligibility',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );

      throw new Error('Error fetching OneTimeWithdrawalEligibility');
    }

    if (rawResponse.status === 400 && response.status === 'failure') {
      logTrace('Withdrawal ineligible reason', {
        results: response?.validationResult,
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'getOneTimeWithdrawalEligibility',
  }
);

export const getOneTimeWithdrawalValidation = withLogging<
  [PolicyRequestInputs, PartialWithdrawalOneTimeRequest],
  WithdrawalValidationResposne
>(
  async (
    options: PolicyRequestInputs,
    pwotRequestDetails: PartialWithdrawalOneTimeRequest,
    loggingCtx: CommonLogContext
  ) => {
    const { planCode, policyNumber } = options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/partialwithdrawalonetime/validation`;

    try {
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

      if (
        rawResponse.status > 400 &&
        response.status === TransactionFailureResponse.status.FAILURE
      ) {
        logError(
          'Error fetching one time withdrawal validation',
          await logApiNotOkDetails({ rawResponse, parsedResponse: response })
        );

        throw new Error('Error fetching PolicyLoanEligibility');
      }

      if (
        // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
        rawResponse.status === 400 &&
        response.status === TransactionFailureResponse.status.FAILURE
      ) {
        logTrace('one time validationinvalid reason', {
          results: response.validationResult,
        });

        return {
          data: {
            status: TransactionFailureResponse.status.FAILURE,
            validationResult: response.validationResult,
          },
          error: null,
        };
      }

      if (response.status === TransactionFailureResponse.status.SUCCESS) {
        return {
          data: {
            status: TransactionFailureResponse.status.SUCCESS,
            quoteResponse: response.quoteResponse,
          },
          error: null,
        };
      }

      throw new Error('Error fetching one time withdrawal validation');
    } catch (error) {
      logError('Error fetching one time withdrawal validation', { error });
      return {
        data: null,
        error: {
          status: 500,
          name: 'Error fetching one time withdrawal validation',
          message: 'error fetching one time withdrawal validation',
        },
      };
    }
  },
  {
    file: CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH,
    functionName: 'getOneTimeWithdrawalValidation',
  }
);

export const getWithdrawalEligibility = withLogging<
  [PolicyRequestInputs],
  WithdrawalEligibilityResponse
>(
  async (policyInputs: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    logTrace('getWithdrawalEligibility::start', {
      planCode: policyInputs.planCode,
      policyNumber: policyInputs.policyNumber,
    });

    try {
      const { data, error } = await getOneTimeWithdrawalEligibility(
        policyInputs,
        loggingCtx
      );

      if (!data || data.status !== TransactionFailureResponse.status.SUCCESS) {
        throw error || new Error('No data returned from BPM');
      }

      const parsedData = transformEligibility(data);

      return {
        data: parsedData,
        error: null,
      };
    } catch (error) {
      logWarn('getWithdrawalEligibility::error', { error });

      return {
        data: null,
        error: {
          message: 'Something went wrong',
          status: 500,
          name: 'getWithdrawalEligibility Error',
        },
      };
    }
  },
  {
    file: FILE_NAME,
    functionName: 'getWithdrawalEligibility',
  }
);
