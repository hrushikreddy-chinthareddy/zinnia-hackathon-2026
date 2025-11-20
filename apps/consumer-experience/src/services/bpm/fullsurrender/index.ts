import { transactionApiBaseUrl } from '@/services/api-config';
import { transformEligibility } from '@/services/bpm/transformers';
import { ServerApi } from '@/services/server-http';
import { ApiResponse } from '@/services/types';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logTrace } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';
import {
  AmountType,
  DisbursementPaymentForm,
  DisbursementType,
  FullSurrenderRequest,
  TransactionAcceptedResponse,
  TransactionFailureResponse,
  TransactionResponse,
} from '@zinnia/api-types/types/bpm';

const FILE_NAME = '/src/services/bpm/fullsurrender/index.ts';

type FullSurrenderBPMSucessResponse = {
  status: TransactionResponse.status.SUCCESS;
} & TransactionResponse;

type FullSurrenderBPMErrorResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

export type FullSurrenderBPMResponse =
  | FullSurrenderBPMSucessResponse
  | FullSurrenderBPMErrorResponse;

export type FullSurrenderSubmissionResponse =
  ApiResponse<TransactionAcceptedResponse>;

export interface FullSurrenderBPMRequest
  extends Omit<FullSurrenderRequest, 'taxWithholdingInstructions'> {
  transactionAmounts: {
    requestedAmount: number;
    amountType: AmountType;
    disbursementType: DisbursementType;
    disbursementPaymentForm: DisbursementPaymentForm;
  };
  // override the exemptions field to be nullable
  taxWithholdingInstructions: (Omit<
    NonNullable<FullSurrenderRequest['taxWithholdingInstructions']>[number],
    'exemptions'
  > & {
    exemptions: number | null;
  })[];
}

export const getPolicySurrenderEligibility = withLogging(
  async (
    planCode: string,
    policyNumber: string,
    loggingCtx: CommonLogContext
  ): Promise<TransactionEligbility> => {
    const url = `${transactionApiBaseUrl}/${planCode}/${policyNumber}/fullsurrender/eligibilitycheck`;
    const rawResponse = await ServerApi.post(
      url,
      // For some reason we need to pass a body here, even if it's empty.
      // The backend team knows about this.
      JSON.stringify({
        correlationId: '',
        effectiveDate: '',
        reverseInitiator: false,
        taxWithholdingInstructions: [],
        payeeOrBeneficiary: null,
        parties: [],
        transactionAmounts: {
          requestedAmount: null,
          amountType: '',
          disbursementType: '',
          disbursementPaymentForm: '',
        },
        charges: null,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (rawResponse.status === 400) {
      logTrace('Surrender ineligible reason', {
        results: response?.validationResult,
      });
    }

    if (rawResponse.status > 400) {
      throw new Error('Error checking eligibility for full surrender.', {
        cause: { policyNumber, planCode },
      });
    }
    return transformEligibility(response);
  },
  { file: FILE_NAME, functionName: 'getPolicySurrenderEligibility' }
);

export const getPolicySurrenderValidation = withLogging(
  async (
    options: PolicyRequestInputs,
    body: FullSurrenderBPMRequest,
    loggingCtx: CommonLogContext
  ): Promise<FullSurrenderBPMResponse> => {
    const { planCode, policyNumber } = options;
    const url = `${transactionApiBaseUrl}/${planCode}/${policyNumber}/fullsurrender/validation`;

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
    const response = await parseAPIResponse(rawResponse);

    if (
      rawResponse.status > 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      throw new Error('Error checking validation for full surrender', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
          status: rawResponse?.status,
        },
      });
    }

    return response;
  },
  { file: FILE_NAME, functionName: 'getPolicySurrenderValidation' }
);

export const submitFullSurrender = withLogging(
  async (
    options: PolicyRequestInputs,
    body: FullSurrenderBPMRequest,
    loggingCtx: CommonLogContext
  ): Promise<FullSurrenderSubmissionResponse> => {
    const { planCode, policyNumber } = options;
    const url = `${transactionApiBaseUrl}/${planCode}/${policyNumber}/fullsurrender`;
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
    const response = await parseAPIResponse(rawResponse);

    if (
      rawResponse.status > 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      throw new Error('Error submitting full surrender request', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
          status: rawResponse?.status,
        },
      });
    }
    return response;
  },
  { file: FILE_NAME, functionName: 'submitFullSurrender' }
);
