'use server';

import { CommunicationPreferenceChange } from '@zinnia/api-types/types/bpm';
import { UpdateEDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';
import dayjs from 'dayjs';

import { ApiResponse, bpmApiBaseUrl, ServerApi } from '@/services';
import { BPMResponse } from '@/types/transactions';

import {
  ActionTypes,
  TransactionTypes,
  returnErrorResponse,
  returnSuccessResponse,
} from './utils';

/**
 * Updates the communication preferences through BPM API.
 *
 * @param {Object} params - The parameters for updating preferences.
 * @param {string} params.planCode - The plan code.
 * @param {string} params.policyNumber - The policy number.
 * @param {UpdateEDeliveryPreferenceModel} params.newPreferencesData - The new preferences data.
 * @return {Promise<ApiResponse>} The API response containing status and messages.
 */
export const updatePreferencesByPlanCode = async ({
  planCode,
  policyNumber,
  policyPartyId,
  newPreferencesData,
}: {
  planCode: string;
  policyNumber: string;
  /**
   * This is the partyId from the party on the policy
   * NOT the partyId associated with auth
   */
  policyPartyId: string;
  newPreferencesData: UpdateEDeliveryPreferenceModel;
}): Promise<ApiResponse<BPMResponse>> => {
  try {
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${policyPartyId}/communicationpreference`;

    const isMailPreference =
      newPreferencesData.deliveryOption ===
      UpdateEDeliveryPreferenceModel.deliveryOption.MAIL;

    // Because these are processed after 8pm est, if a user tries to update
    // there communication preference after that time and we set effectiveDate to
    // their current day, the request will fail. So if after 8pm est, set effective
    // day to next day
    const easternTime = dayjs().tz('America/New_York');
    let effectiveDate = dayjs();
    if (easternTime.isAfter(easternTime.hour(20), 'hour')) {
      effectiveDate = effectiveDate.add(1, 'day');
    }

    const reqBody = {
      communicationPreference: {
        preferredCommunicationType: isMailPreference
          ? CommunicationPreferenceChange.preferredCommunicationType.REGULARMAIL
          : CommunicationPreferenceChange.preferredCommunicationType.EMAIL,
      },
      effectiveDate,
    };

    const rawResponse = await ServerApi.post(url, JSON.stringify(reqBody), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!rawResponse.ok) {
      throw new Error('Error updating communication preferences.');
    }

    return await returnSuccessResponse(
      rawResponse,
      TransactionTypes.COMMUNICATION_PREFERENCE,
      ActionTypes.EDIT
    );
  } catch (e) {
    return returnErrorResponse(
      e,
      TransactionTypes.COMMUNICATION_PREFERENCE,
      ActionTypes.EDIT
    );
  }
};
