'use server';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { ApiResponse, bpmApiBaseUrl, ServerApi } from '@/services';
import { ActionTypes } from '@/store/store';
import { AddressRequest, BPMResponse } from '@/types/transactions';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

import {
  returnErrorResponse,
  returnSuccessResponse,
  TransactionTypes,
} from './utils';

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
        preferredAddressIndicator:
          addressChangeRequest.preferredAddressIndicator,
        preferredAddressId: addressChangeRequest.preferredAddressId,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return await returnSuccessResponse(
      rawResponse,
      TransactionTypes.ADDRESS,
      ActionTypes.REMOVE
    );
  } catch (e: unknown) {
    return returnErrorResponse(e, TransactionTypes.ADDRESS, ActionTypes.REMOVE);
  }
};

export const postAddAddress = async (
  options: AddressRequest
): Promise<ApiResponse<BPMResponse>> => {
  const {
    planCode,
    policyNumber,
    partyId,
    addressChangeRequest,
    correlationId,
  } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/address`;

  try {
    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify({
        ...addressChangeRequest,
        correlationId: correlationId || uuidv4(),
        effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return await returnSuccessResponse(
      rawResponse,
      TransactionTypes.ADDRESS,
      ActionTypes.ADD
    );
  } catch (e) {
    return returnErrorResponse(e, TransactionTypes.ADDRESS, ActionTypes.ADD);
  }
};

export const putUpdateAddress = async (
  options: AddressRequest
): Promise<ApiResponse<BPMResponse>> => {
  const {
    planCode,
    policyNumber,
    partyId,
    addressChangeRequest,
    addressId,
    correlationId,
  } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/address/${addressId}`;
  try {
    const rawResponse = await ServerApi.put(
      url,
      JSON.stringify({
        ...addressChangeRequest,
        correlationId: correlationId || uuidv4(),
        effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
        // TODO: this should be a variable, once delete is set up
        deleteRequest: false,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return await returnSuccessResponse(
      rawResponse,
      TransactionTypes.ADDRESS,
      ActionTypes.EDIT
    );
  } catch (e) {
    return returnErrorResponse(e, TransactionTypes.ADDRESS, ActionTypes.EDIT);
  }
};
