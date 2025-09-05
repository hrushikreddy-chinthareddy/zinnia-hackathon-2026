'use server';
import {
  ArrangementType,
  SystematicProgramUpdateRequest,
  TransactionAcceptedResponse,
  TransactionFailureResponse,
  TransactionResponse,
} from '@xd/api-types/dist/generated-types/bpm';
import dayjs from 'dayjs';
import { CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH } from 'next/dist/shared/lib/constants';

import { bpmApiBaseUrl } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { transformEligibility } from '../transformers';

const FILE_NAME = 'bpm/index.ts';

type SystematicProgramServiceInputs = PolicyRequestInputs & {
  arrangementId?: string;
};

type SystematicProgramBPMSucessResponse = {
  status: TransactionResponse.status.SUCCESS;
} & TransactionResponse;

type SystematicProgramBPMErrorResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

export type SystematicProgramBPMResponse =
  | SystematicProgramBPMSucessResponse
  | SystematicProgramBPMErrorResponse;

export type TransactionEligbilityResponse = {
  status:
    | TransactionResponse.status.SUCCESS
    | TransactionFailureResponse.status.FAILURE;
};

type SystematicProgramTransactionFailureResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

type SystematicProgramTransactionSuccessResponse = {
  caseId: string;
} & TransactionAcceptedResponse;

export type SystematicProgramTransactionResponse =
  | SystematicProgramTransactionSuccessResponse
  | SystematicProgramTransactionFailureResponse;

export const getSystematicProgramsEligibility = withLogging(
  async (
    { planCode, policyNumber }: SystematicProgramServiceInputs,
    loggingCtx: CommonLogContext
  ): Promise<TransactionEligbilityResponse> => {
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicprograms/eligibilitycheck`;
    // We are checking for eligibiilty for creating a new systematic program
    // with no reference to the programs that may or may not already be in place
    // so this body should not be passed by consumer of the endpoint
    // and will always be this exact same object
    const body = {
      effectiveDate: dayjs().add(1, 'day').format(ZAHARA_DATE_FORMAT),
      systematicProgram: {
        arrangementType: ArrangementType.PAYMENT,
      },
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

    const response: TransactionEligbilityResponse =
      await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400) {
      logError(
        'Error fetching systematic programs eligibility',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );
    }

    // This endpoint returns 400 "not found" when the policy is not eligible systematic programs
    if (
      rawResponse.status === 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      logTrace('systematic programs ineligible', {
        results: response.status,
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'getSystematicProgramsEligibilityCheck',
  }
);

export const getSystematicProgramEligibility = withLogging(
  async (
    { planCode, policyNumber, arrangementId }: SystematicProgramServiceInputs,
    loggingCtx: CommonLogContext
  ): Promise<TransactionEligbility> => {
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicprograms/${arrangementId}/eligibilitycheck`;
    const body = {
      effectiveDate: dayjs().add(1, 'day').format(ZAHARA_DATE_FORMAT),
      systematicProgram: {
        arrangementType: ArrangementType.PAYMENT,
        arrangementId,
      },
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

    const response: TransactionEligbilityResponse =
      await parseAPIResponse(rawResponse);

    if (rawResponse.status === 400) {
      logTrace(
        `systematic program with arrangementId ${arrangementId} ineligible`,
        {
          arrangementId,
          results: response.status,
        }
      );
    }

    if (rawResponse.status > 400) {
      throw new Error('Error fetching systematic program eligibility', {
        cause: { planCode, policyNumber, arrangementId },
      });
    }

    return transformEligibility(response);
  },
  {
    file: FILE_NAME,
    functionName: 'getSystematicProgramEligibility',
  }
);

export const getSystematicProgramValidation = withLogging(
  async (
    { arrangementId, planCode, policyNumber }: SystematicProgramServiceInputs,
    body: SystematicProgramUpdateRequest,
    loggingCtx: CommonLogContext
  ): Promise<SystematicProgramBPMResponse> => {
    let url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicprograms`;

    if (arrangementId) {
      url += `/${arrangementId}`;
    }

    url += '/validation';

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(body),
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
      loggingCtx
    );

    const response: SystematicProgramBPMResponse =
      await parseAPIResponse(rawResponse);

    if (
      rawResponse.status > 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      throw new Error('Error fetching PolicyLoanEligibility');
    }

    if (
      // This endpoint returns 400 "not found" when the policy is not eligible SystematicPrograms
      rawResponse.status === 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      logTrace('one time validationinvalid reason', {
        results: response.validationResult,
      });

      return {
        status: TransactionFailureResponse.status.FAILURE,
        validationResult: response.validationResult,
      };
    }

    if (response.status === TransactionResponse.status.SUCCESS) {
      return {
        status: TransactionResponse.status.SUCCESS,
        quoteResponse: response.quoteResponse,
      };
    }

    throw new Error('Error fetching systematic program validation');
  },
  {
    file: CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH,
    functionName: 'getSystematicProgramValidation',
  }
);

export const submitSystematicProgram = withLogging(
  async (
    { planCode, policyNumber }: SystematicProgramServiceInputs,
    requestBody: SystematicProgramUpdateRequest,
    loggingCtx: CommonLogContext
  ): Promise<SystematicProgramTransactionResponse> => {
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicprograms`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(requestBody),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );
    const response: SystematicProgramTransactionResponse =
      await parseAPIResponse(rawResponse);

    if ('caseId' in response) {
      return response;
    }

    throw new Error('Error submitting systematic program');
  },
  {
    file: FILE_NAME,
    functionName: 'submitSystematicProgram',
  }
);

export const editSystematicProgram = withLogging(
  async (
    { arrangementId, planCode, policyNumber }: SystematicProgramServiceInputs,
    body: SystematicProgramUpdateRequest,
    loggingCtx: CommonLogContext
  ): Promise<SystematicProgramTransactionResponse> => {
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicprograms/${arrangementId}`;

    const rawResponse = await ServerApi.put(
      url,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: SystematicProgramTransactionResponse =
      await parseAPIResponse(rawResponse);

    if ('caseId' in response) {
      return response;
    }

    throw new Error('Error editing Systematic Program');
  },
  {
    file: FILE_NAME,
    functionName: 'editSystematicProgram',
  }
);

export const cancelSystematicProgram = withLogging(
  async (
    { planCode, policyNumber, arrangementId }: SystematicProgramServiceInputs,
    body: SystematicProgramUpdateRequest,
    loggingCtx: CommonLogContext
  ): Promise<SystematicProgramTransactionResponse> => {
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicprograms/${arrangementId}`;

    const rawResponse = await ServerApi.put(
      url,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: SystematicProgramTransactionResponse =
      await parseAPIResponse(rawResponse);

    if ('caseId' in response) {
      return response;
    }

    throw new Error('Error cancelling Systematic Program');
  },
  {
    file: FILE_NAME,
    functionName: 'cancelSystematicProgram',
  }
);
