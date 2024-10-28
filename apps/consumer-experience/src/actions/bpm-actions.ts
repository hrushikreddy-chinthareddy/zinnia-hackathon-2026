'use server';

import { BankAccountChangeRequest } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { BankDetail } from '@/components/person-data/types';
import {
  ApiResponse,
  bpmApiBaseUrl,
  getUnsanitizedBanksByPolicyPlanCodeAndId,
  ServerApi,
} from '@/services';
import { BankRequest } from '@/types/transactions';
import { parseAPIResponse, logApiNotOkDetails } from '@/utils/api';
import {
  bankAccountNumberSanitizer,
  filterItemsWithPastEndDate,
  getBankAccountByBankId,
} from '@/utils/data';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError } from '@/utils/logging/server-logging';

interface AddBankRequestArgs {
  planCode: string;
  policyNumber: string;
  partyId: string;
  bankId?: string;
  bankAccountChangeRequest: BankAccountChangeRequest;
}

interface BPMBankResponse {
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
): Promise<ApiResponse<BPMBankResponse>> => {
  try {
    const { planCode, policyNumber, partyId, bankAccountChangeRequest } =
      options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/bankaccount`;

    // We have to get the check that this bank hasn't already been added previously.
    const banks = await getUnsanitizedBanksByPolicyPlanCodeAndId({
      planCode,
      policyNumber,
    });

    const filteredBanks = filterItemsWithPastEndDate(banks);

    if (filteredBanks && bankAccountChangeRequest?.bankAccount) {
      if (
        filteredBanks?.find(
          b =>
            (b as BankDetail).accountNumber ===
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
      throw rawResponse;
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
        cause: (e as Response)?.statusText,
        status: (e as Response)?.status ?? 502,
        name: "Sorry, that didn't work.",
        message:
          (e as Response)?.status >= 500
            ? "Services are down, so we couldn't add your account. Please try again later."
            : "We couldn't add your account. Please try again later.",
      },
    };
  }
};

export const addBankRequest = async (
  options: AddBankRequestArgs
): Promise<ApiResponse<BPMBankResponse>> => {
  return await postAddBankAccount(options);
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
): Promise<ApiResponse<BPMBankResponse>> => {
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
      throw rawResponse;
    }

    const messages = {
      title: `Bank Account deleted`,
      message: `${options?.bankAccountChangeRequest.bankAccount?.branchName} ending in ${bankAccountNumberSanitizer(options?.bankAccountChangeRequest?.bankAccount?.accountNumber)} was removed.`,
    };

    return { data: { ...parsedResponse, messages }, error: null };
  } catch (e) {
    logError('Error deleting bank', e);

    return {
      data: null,
      error: {
        cause: (e as Response)?.statusText,
        status: (e as Response)?.status ?? 502,
        name: "Sorry, that didn't work.",
        message:
          (e as Response)?.status >= 500
            ? "Services are down, so we couldn't remove your account. Please try again later."
            : "We couldn't remove your account. Please try again later.",
      },
    };
  }
};
