'use server';

import { OneTimePremiumTransaction } from '@zinnia/api-types/types/bpm';
import { BankAccountChangeRequest } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { FormMode } from '@/components/add-edit-bank/shared-types';
import { ApiEndpoints } from '@/components/dev-menu/types';
import { OttpState } from '@/components/providers/one-time-premium-payment/types';
import {
  ApiResponse,
  bpmApiBaseUrl,
  getUnsanitizedBanksByPolicyPlanCodeAndId,
  ServerApi,
  isMockErrorEnabled,
} from '@/services';
import { submitOneTimePremiumPayment } from '@/services/bpm';
import { BankRequest } from '@/types/transactions';
import { parseAPIResponse, logApiNotOkDetails } from '@/utils/api';
import {
  bankAccountNumberSanitizer,
  getBankAccountByBankId,
} from '@/utils/data';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError } from '@/utils/logging/server-logging';
import { areAllValuesNull } from '@/utils/objects';

interface AddEditBankRequestArgs {
  planCode: string;
  formMode: FormMode;
  policyNumber: string;
  partyId: string;
  bankId?: string;
  bankAccountChangeRequest: BankAccountChangeRequest;
}

interface AddEditBankResponse {
  correlationId: string;
  caseId: string;
  caseStatus: string;
  messages: {
    title: string;
    message: string;
  };
}

/**
 * Posts a bank account to the BPM API.
 *
 * @param {BankRequest} options - The options for adding a bank account.
 * @param {string} options.planCode - The plan code.
 * @param {string} options.policyNumber - The policy number.
 * @param {string} options.partyId - The party ID.
 * @param {BankAccountChangeRequest} options.bankAccountChangeRequest - The bank account change request.
 * @return {Promise<ApiResponse>} The API response containing the bank account details or an error.
 */
export const postAddBankAccount = async (
  options: BankRequest
): Promise<ApiResponse<AddEditBankResponse>> => {
  try {
    const { planCode, policyNumber, partyId, bankAccountChangeRequest } =
      options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/bankaccount`;

    // We have to get the check that this bank hasn't already been added previously.
    const banks = await getUnsanitizedBanksByPolicyPlanCodeAndId({
      planCode,
      policyNumber,
    });

    if (banks && bankAccountChangeRequest?.bankAccount) {
      if (
        banks?.find(
          b =>
            b.accountNumber ===
            bankAccountChangeRequest.bankAccount?.accountNumber
        )
      ) {
        return {
          data: null,
          error: {
            cause: 'ALREADY_EXISTS',
            status: 400,
            name: "You've already saved this account.",
            message: `${options?.bankAccountChangeRequest.bankAccount?.branchName} ending in ${bankAccountNumberSanitizer(options?.bankAccountChangeRequest?.bankAccount?.accountNumber)} has already been added to this account.`,
          },
        };
      }
    }

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify({
        ...bankAccountChangeRequest,
        correlationId: uuidv4(),
        effectiveDate: dayjs().format('YYYY-MM-DD'),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const parsedResponse = await parseAPIResponse(rawResponse);
    //TODO: If response NOT ok, OR if response OK but the result contains an exception status
    if (!rawResponse.ok) {
      logError(
        'Error adding bank',
        await logApiNotOkDetails({
          rawResponse,
          parsedResponse: parsedResponse,
        })
      );
      throw parsedResponse;
    }

    const messages = {
      title: `Bank Account added`,
      message: `${options?.bankAccountChangeRequest.bankAccount?.branchName} ending in ${bankAccountNumberSanitizer(options?.bankAccountChangeRequest?.bankAccount?.accountNumber)} was added.`,
    };

    return { data: { ...parsedResponse, messages }, error: null };
  } catch (e) {
    logError('Error adding bank', e);
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'An error occurred',
        message: "We couldn't add this bank account",
      },
    };
  }
};

/**
 * Updates a bank account in the BPM API.
 *
 * @param {BankRequest} options - The options for updating a bank account.
 * @param {string} options.planCode - The plan code.
 * @param {string} options.policyNumber - The policy number.
 * @param {string} options.partyId - The party ID.
 * @param {BankAccountChangeRequest} options.bankAccountChangeRequest - The updated bank account details.
 * @param {string} options.bankId - The ID of the bank account to update.
 * @return {Promise<ApiResponse>} The API response containing the updated bank account details or an error.
 */
export const putUpdateBankAccount = async (
  options: BankRequest
): Promise<ApiResponse<AddEditBankResponse>> => {
  try {
    const { planCode, policyNumber, partyId, bankAccountChangeRequest } =
      options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/bankaccount/${options.bankId}`;

    // We have to get the full bank account number serverside, because we scrub this data on the client side.
    let bankToUpdate;
    const banks = await getUnsanitizedBanksByPolicyPlanCodeAndId({
      planCode,
      policyNumber,
    });

    if (banks && options.bankId) {
      bankToUpdate = getBankAccountByBankId(options.bankId, banks || []);
    }

    const rawResponse = await ServerApi.put(
      url,
      JSON.stringify({
        bankAccount: {
          ...bankToUpdate,
          branchName: bankAccountChangeRequest.bankAccount?.branchName,
          accountType: bankAccountChangeRequest.bankAccount?.accountType,
          branchAddress: areAllValuesNull(bankToUpdate?.branchAddress || {})
            ? null
            : bankToUpdate?.branchAddress, //We need to do this because Zahara will fail if we send the branchAddress object with all null values for some reason. https://se2llc-global.slack.com/archives/C04N0DSKKNW/p1722871751338089
        },
        correlationId: uuidv4(),
        effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const parsedResponse = await parseAPIResponse(rawResponse);
    console.log({ parsedResponse });
    //TODO: If response NOT ok, OR if response OK but the result contains an exception status
    if (!rawResponse.ok) {
      logError(
        'Error updating bank',
        await logApiNotOkDetails({
          rawResponse,
          parsedResponse: parsedResponse,
        })
      );
      throw parsedResponse;
    }

    const messages = {
      title: `Bank Account updated`,
      message: `${options?.bankAccountChangeRequest.bankAccount?.branchName} ending in ${bankAccountNumberSanitizer(options?.bankAccountChangeRequest?.bankAccount?.accountNumber)} was updated.`,
    };

    return { data: { ...parsedResponse, messages }, error: null };
  } catch (e) {
    logError('Error updating bank', e);
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'An error occurred',
        message: "We couldn't update this bank account",
      },
    };
  }
};

export const addEditBankRequest = async (
  options: AddEditBankRequestArgs
): Promise<ApiResponse<AddEditBankResponse>> => {
  if (options.formMode === FormMode.ADD) {
    return await postAddBankAccount(options);
  }
  return await putUpdateBankAccount(options);
};

/**
 * Deletes a bank account from the BPM API by setting an end date.
 *
 * @param {BankRequest} options - The options for deleting a bank account.
 * @param {string} options.planCode - The plan code.
 * @param {string} options.policyNumber - The policy number.
 * @param {string} options.partyId - The party ID.
 * @param {string} options.bankId - The ID of the bank account to delete.
 * @return {Promise<ApiResponse>} The API response containing the deleted bank account details or an error.
 *
 * TODO: Ed: does this actually work? Unused in digital experience repo
 */
export const putEndDateBankAccount = async (
  options: BankRequest
): Promise<ApiResponse<AddEditBankResponse>> => {
  const { planCode, policyNumber, partyId, bankId } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/bankaccount/${bankId}`;

  try {
    // We have to get the full bank account number serverside, because we scrub this data on the client side.
    let bankAccount;
    const banks = await getUnsanitizedBanksByPolicyPlanCodeAndId({
      planCode,
      policyNumber,
    });

    if (banks && options.bankId) {
      bankAccount = getBankAccountByBankId(options.bankId, banks || []);
    }
    const rawResponse = await ServerApi.put(
      url,
      JSON.stringify({
        bankAccount: {
          ...bankAccount,
          endDate: dayjs().format(ZAHARA_DATE_FORMAT),
        },
        correlationId: uuidv4(),
        effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
        deleteRequest: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const parsedResponse = await parseAPIResponse(rawResponse);
    //TODO: If response NOT ok, OR if response OK but the result contains an exception status
    if (!rawResponse.ok) {
      logError(
        'Error deleting bank',
        await logApiNotOkDetails({
          rawResponse,
          parsedResponse: parsedResponse,
        })
      );
      throw parsedResponse;
    }

    const messages = {
      title: `Bank Account deleted`,
      message: `${options?.bankAccountChangeRequest.bankAccount?.branchName} ending in ${bankAccountNumberSanitizer(options?.bankAccountChangeRequest?.bankAccount?.accountNumber)} was removed.`,
    };

    return { data: { ...parsedResponse, messages }, error: null };
  } catch (e) {
    logError('Error updating bank', e);
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'An error occurred',
        message: "We couldn't remove this bank account",
      },
    };
  }
};

export async function submitOneTimePaymentAction(ottpData: {
  paymentDetails: OttpState;
  planCode: string;
  policyNumber: string;
  // TODO: fix this any response
}): Promise<ApiResponse<any>> {
  if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
    throw new Error('Error fetching withdrawal eligibility.');
  }

  const { policyNumber, planCode, paymentDetails } = ottpData;
  const ottpRequest = {
    // TODO: do we need to check for current caseId?
    caseId: '',
    // TODO: add this to logging
    correlationId: uuidv4(),
    effectiveDate: dayjs(paymentDetails.effectiveDate).format(
      ZAHARA_DATE_FORMAT
    ),
    transactionAmounts: {
      requestedAmount: paymentDetails.paymentAmount,
    },
    payor: {
      partyId: paymentDetails.payorBank?.appliesToPartyId,
      bankId: paymentDetails.payorBank?.bankId,
      paymentForm: OneTimePremiumTransaction.paymentForm.ACH,
    },
    // TODO: do we need to pass this?
    // reverseInitiator: false
  };

  try {
    const oneTimePayment = await submitOneTimePremiumPayment(
      { planCode, policyNumber },
      ottpRequest
    );

    return {
      // TODO: what should we actually return here?
      data: oneTimePayment,
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      // TODO: add 500 vs 400 message?
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'submitOneTimePaymentAction Error',
      },
    };
  }
}
