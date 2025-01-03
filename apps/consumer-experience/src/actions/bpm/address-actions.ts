'use server';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { ApiResponse, bpmApiBaseUrl, ServerApi } from '@/services';
import { isBpmError } from '@/services/bpm/types';
import { AddressRequest, BPMResponse } from '@/types/transactions';
import { parseAPIResponse, logApiNotOkDetails } from '@/utils/api';
import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError } from '@/utils/logging/server-logging';

import { returnErrorResponse } from './utils';

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
 */
export const putEndDateAddress = async (
  options: AddressRequest
): Promise<ApiResponse<BPMResponse>> => {
  const { planCode, policyNumber, partyId, addressId, addressChangeRequest } =
    options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/address/${addressId}`;

  try {
    const rawResponse = await ServerApi.put(
      url,
      JSON.stringify({
        address: {
          ...addressChangeRequest.address,
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
    if (!rawResponse.ok) {
      logError(
        'Error deleting address',
        await logApiNotOkDetails({
          rawResponse,
          parsedResponse: parsedResponse,
        })
      );
      if (isBpmError(parsedResponse)) {
        throw parsedResponse;
      }
      throw rawResponse;
    }
    const phone = `<a href="tel:+${EVERLY_CONTACT_PHONE_NUMBER}">${EVERLY_CONTACT_PHONE_NUMBER}</a>`;

    const messages = {
      title: `Thanks!`,
      message: `Address is being removed. Address changes may not save immediately. If you need assistance to change an address, call ${phone}.<br /><br />Note: Updating this address won't affect your other policies. Update each policy individually if they share this address.`,
    };

    return { data: { ...parsedResponse, messages }, error: null };
  } catch (e: unknown) {
    return returnErrorResponse(e);
  }
};

export const postAddAddress = async (
  options: AddressRequest
): Promise<ApiResponse<BPMResponse>> => {
  const { planCode, policyNumber, partyId, addressChangeRequest } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/address`;

  try {
    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify({
        ...addressChangeRequest,
        correlationId: uuidv4(),
        effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const parsedResponse = await parseAPIResponse(rawResponse);
    if (!rawResponse.ok) {
      logError(
        'Error deleting address',
        await logApiNotOkDetails({
          rawResponse,
          parsedResponse: parsedResponse,
        })
      );
      if (isBpmError(parsedResponse)) {
        throw parsedResponse;
      }
      throw rawResponse;
    }

    const messages = {
      title: `Thanks!`,
      // TODO: what should this message be? if we show the address, needs to include pii wrapper!!!
      message: 'Your address is being added.',
    };

    return { data: { ...parsedResponse, messages }, error: null };
  } catch (e) {
    return returnErrorResponse(e);
  }
};

export const putUpdateAddress = async (
  options: AddressRequest
): Promise<ApiResponse<BPMResponse>> => {
  const { planCode, policyNumber, partyId, addressChangeRequest, addressId } =
    options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/address/${addressId}`;

  try {
    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify({
        ...addressChangeRequest,
        correlationId: uuidv4(),
        effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
        // TODO: this should be a variable, once delete is set up
        deleteRequest: false,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const parsedResponse = await parseAPIResponse(rawResponse);
    if (!rawResponse.ok) {
      logError(
        'Error deleting address',
        await logApiNotOkDetails({
          rawResponse,
          parsedResponse: parsedResponse,
        })
      );
      if (isBpmError(parsedResponse)) {
        throw parsedResponse;
      }
      throw rawResponse;
    }

    const messages = {
      title: `Thanks!`,
      // TODO: what should this message be? if we show the address, needs to include pii wrapper!!!
      message: 'Your address is being updated.',
    };

    return { data: { ...parsedResponse, messages }, error: null };
  } catch (e) {
    return returnErrorResponse(e);
  }
};
