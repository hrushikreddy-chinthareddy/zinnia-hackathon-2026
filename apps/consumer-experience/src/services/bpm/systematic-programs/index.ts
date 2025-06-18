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

import { SystematicPremiumsState } from '@/components/providers/systematic-premiums/types';
import { PolicyRequestInputs } from '@/types/policy';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { CommonLogContext, logError, logTrace } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { bpmApiBaseUrl, transactionApiBaseUrl } from '../../api-config';
import { ServerApi } from '../../server-http';
import { systematicPremiumsStateToPolicyRequestInput } from '../transformers';

const FILE_NAME = 'bpm/index.ts';

type SystematicPremiumBPMSucessResponse = {
  status: TransactionResponse.status.SUCCESS;
} & TransactionResponse;

type SystematicPremiumBPMErrorResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

type SystematicPremiumBPMResponse =
  | SystematicPremiumBPMSucessResponse
  | SystematicPremiumBPMErrorResponse;

export type TransactionEligbilityResponse = {
  status:
    | TransactionResponse.status.SUCCESS
    | TransactionFailureResponse.status.FAILURE;
};

export const submitSystematicPremium = withLogging(
  async (
    options: PolicyRequestInputs,
    SystematicPremiumState: SystematicPremiumsState,
    loggingCtx: CommonLogContext
  ): Promise<TransactionAcceptedResponse> => {
    const { planCode, policyNumber } = options;
    const body = systematicPremiumsStateToPolicyRequestInput(
      SystematicPremiumState,
      loggingCtx.correlationId
    );

    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicPremium`;

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
      throw new Error('Error submitting systematic premium');
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'submitsystematicpremium',
  }
);

export const getSystematicPremiumValidation = withLogging(
  async (
    options: PolicyRequestInputs,
    pwotRequestDetails: SystematicProgramUpdateRequest,
    loggingCtx: CommonLogContext
  ): Promise<SystematicPremiumBPMResponse> => {
    const { planCode, policyNumber } = options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/systematicpremium/validation`;

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

    const response: SystematicPremiumBPMResponse =
      await parseAPIResponse(rawResponse);

    if (
      rawResponse.status > 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      throw new Error('Error fetching PolicyLoanEligibility');
    }

    if (
      // This endpoint returns 400 "not found" when the policy is not eligible SystematicPremiums
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

    throw new Error('Error fetching systematic premium validation');
  },
  {
    file: CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH,
    functionName: 'getsystematicpremiumValidation',
  }
);

export const getSystematicProgramsEligibility = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<TransactionEligbilityResponse> => {
    const { planCode, policyNumber } = options;
    const url = `${transactionApiBaseUrl}/${planCode}/${policyNumber}/systematicprograms/eligibilitycheck`;
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

    if(rawResponse.status > 400) {
      logError(
        'Error fetching systematic programs eligibility',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );
    }

    // This endpoint returns 400 "not found" when the policy is not eligible systematic premiums
    if (
      rawResponse.status === 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      logTrace('systematic programs ineligible', {
        results: response.status,
      })
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'getSystematicProgramsEligibilityCheck',
  }
);
