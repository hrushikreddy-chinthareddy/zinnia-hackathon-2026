'use server';
import { getMfaCookie, setMfaOobCookie } from '@/utils/auth';
import { logTrace } from '@/utils/logging/server-logging';

import { ServerApi } from '../server-http';

export const sendMfaChallenge = async ({
  authenticatorId,
  challengeType,
  ...loggingContext
  //TODO: fix type
}: any) => {
  try {
    const mfaToken = (await getMfaCookie()) || '';
    const response = await ServerApi.sendMfaChallenge({
      authenticatorId,
      challengeType,
      mfaToken,
    });
    const data = await response.json();

    if (response.status === 200) {
      logTrace('successful-response', { ...loggingContext });
      await setMfaOobCookie({
        value: data.oob_code,
      });

      return {
        success: true,
      };
    }

    logTrace('unsuccessful-response', {
      ...loggingContext,
      reqStatus: response.status,
    });
    throw data;
  } catch (error) {
    return {
      success: false,
    };
  }
};
