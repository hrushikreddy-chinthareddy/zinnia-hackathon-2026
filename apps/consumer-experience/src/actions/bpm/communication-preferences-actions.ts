'use server';

import { CommunicationPreferenceChange } from '@zinnia/api-types/types/bpm';
import { UpdateEDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';
import * as jose from 'jose';

import { ApiResponse, bpmApiBaseUrl, ServerApi } from '@/services';
import { UserClaims } from '@/types/auth';
import { BPMResponse } from '@/types/transactions';
import { getAccessToken } from '@/utils/auth';

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
  newPreferencesData,
}: {
  planCode: string;
  policyNumber: string;
  newPreferencesData: UpdateEDeliveryPreferenceModel;
}): Promise<ApiResponse<BPMResponse>> => {
  try {
    const { accessToken } = await getAccessToken();
    const decodedToken = jose.decodeJwt(accessToken ?? '') as UserClaims;
    const partyId = decodedToken.partyId;

    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/parties/${partyId}/communicationpreference`;

    const isMailPreference =
      newPreferencesData.deliveryOption ===
      UpdateEDeliveryPreferenceModel.deliveryOption.MAIL;

    const reqBody = {
      communicationPreference: {
        preferredCommunication: isMailPreference
          ? CommunicationPreferenceChange.preferredCommunicationType.REGULARMAIL
          : CommunicationPreferenceChange.preferredCommunicationType.EMAIL,
      },
    };

    const rawResponse = await ServerApi.put(url, JSON.stringify(reqBody), {
      headers: { 'Content-Type': 'application/json' },
    });

    return await returnSuccessResponse(
      rawResponse,
      TransactionTypes.COMMUNICATION_PREFERENCE,
      ActionTypes.EDIT
    );
  } catch (e) {
    return await returnErrorResponse(
      e,
      TransactionTypes.COMMUNICATION_PREFERENCE,
      ActionTypes.EDIT
    );
  }
};
