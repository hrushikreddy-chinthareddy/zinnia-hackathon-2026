'use server';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { v4 as uuidv4 } from 'uuid';

import { ApiResponse, bpmApiBaseUrl, ServerApi } from '@/services';
import { BPMResponse } from '@/types/transactions';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { CommunicationPreferenceChange } from '@zinnia/api-types/types/bpm';
import { UpdateEDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';

import {
  ActionTypes,
  TransactionTypes,
  returnErrorResponse,
  returnSuccessResponse,
} from './utils';

dayjs.extend(utc);
dayjs.extend(timezone);

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

    // Because these are processed after 3pm cst, if a user tries to update
    // there communication preference after that time and we set effectiveDate to
    // their current day, the request will fail. So if after 3pm cst, set effective
    // day to next day
    const central = dayjs().tz('America/Chicago');
    let effectiveDate = dayjs();
    if (central.isAfter(central.hour(15), 'hour')) {
      effectiveDate = effectiveDate.add(1, 'day');
    }

    // Not sure if there should be a different default besides email
    const prefDetails = isMailPreference
      ? {
          preferredCommunicationType:
            CommunicationPreferenceChange.preferredCommunicationType
              .REGULARMAIL,
        }
      : {
          preferredCommunicationType:
            CommunicationPreferenceChange.preferredCommunicationType.EMAIL,
          email: newPreferencesData.email,
        };

    const reqBody = {
      communicationPreference: prefDetails,
      effectiveDate: dayjs(effectiveDate).format(ZAHARA_DATE_FORMAT),
      correlationId: uuidv4(),
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
