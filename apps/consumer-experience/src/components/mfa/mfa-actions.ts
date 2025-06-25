'use server';
import * as jose from 'jose';
import { FieldValues } from 'react-hook-form';

import { ServerApi } from '@/services';
import {
  Auth0ErrorResponse,
  MfaResponse,
  MfaSendChallengeInputs,
  OauthToken,
  UserClaims,
} from '@/types/auth';
import {
  getMfaCookie,
  getOobMfaCookie,
  setLoginCookies,
  setMfaOobCookie,
  setMfaCookie,
} from '@/utils/auth';
import { logTrace, logWarn } from '@/utils/logging/log-fns';

/**
 * We are using the refreshToken endpoint very specifically to retrieve
 * the mfaToken post login. The mfaToken is needed
 * in order to interact with any mfa APIs
 */
export const getPostLoginMfaToken = async () => {
  try {
    const response = await ServerApi.refreshToken();
    const data = await response.json();

    //
    if ('mfa_token' in data) {
      await setMfaCookie({
        value: data.mfa_token,
      });
    } else {
      // TODO: what should happen here???
      logTrace('no mfa token in data', {
        file: 'transaction-mfa-actions.ts',
        function: 'getPostLoginMfaToken',
      });
    }
  } catch (error) {
    logWarn('getPostLoginMfaToken error', { error });
    console.log(error);
  }
};

export const postLoginSendMfaChallenge = async (formData: FieldValues) => {
  const loggingContext = {
    file: 'transaction-mfa-actions.ts',
    function: 'submitMfaVerification',
  };
  await getPostLoginMfaToken();
  await sendMfaChallenge({
    authenticatorId: formData.verificationType,
    challengeType: 'oob',
    loggingContext,
  });
};

export const sendMfaChallenge = async ({
  authenticatorId,
  challengeType,
  ...loggingContext
  //TODO: fix type
}: Omit<MfaSendChallengeInputs, 'mfaToken'> & {
  loggingContext: Record<string, unknown>;
}) => {
  try {
    const mfaToken = (await getMfaCookie()) || '';
    const response = await ServerApi.sendMfaChallenge({
      authenticatorId,
      challengeType,
      mfaToken,
    });
    const data = await response.json();

    if (response.status === 200) {
      logTrace('sendMfaChallenge successful-response', { ...loggingContext });
      await setMfaOobCookie({
        value: data.oob_code,
      });

      return {
        success: true,
      };
    }

    logTrace('sendMfaChallenge unsuccessful-response', {
      ...loggingContext,
      reqStatus: response.status,
    });
    throw data;
  } catch (error) {
    logWarn('sendMfaChallenge error', { error });
    return {
      success: false,
    };
  }
};

/**
 * Verifies the MFA challenge for the user.
 *
 * @param {Auth0ErrorResponse} _ - Placeholder parameter for error response from Auth0.
 * @param {FormData} formData - Data containing the code, and enrollment status.
 * @return {Promise<Auth0ErrorResponse | never>} Redirects the user based on the verification result.
 */
export async function verifyMfaChallenge(
  // TODO: fix this type
  mfaData: {
    code: string;
    isEnrollment: boolean;
  }
): Promise<MfaResponse | never> {
  const loggingContext = {
    file: 'login-actions.ts',
    function: 'verifyMfaChallenge',
  };
  logTrace('start', { ...loggingContext });
  let data: Auth0ErrorResponse | OauthToken;
  try {
    // We need to know if this is an enrollment or not because it changes how we pass the MFA token to auth0
    // for non enrolled user we need to pass the token as an authorization header
    // for enrolled users we pass it as an input to the API
    const isEnrollment = mfaData?.isEnrollment?.toString() === 'true';
    const mfaToken = await getMfaCookie();
    const code = mfaData?.code || '';
    const oobCode = await getOobMfaCookie();
    // if somehow we get here and we do not have an MFA or OOBCode token we throw an error
    // the error capture will set reDirectToErrorPage to true and redirect to the error page
    if (!mfaToken || !oobCode) {
      logWarn('no-mfa-or-oob-token', {
        ...loggingContext,
        hasMfa: !!mfaToken,
        hasOobCode: !!oobCode,
      });
      throw new Error('No MFA or OOB Token found');
    }

    const response = await ServerApi.verifyMfaChallenge({
      mfaToken,
      bindingCode: code,
      oobCode,
      isEnrollment,
    });

    data = await response.json();

    if (response.status !== 200) {
      logTrace('bad-response::verifyMfaChallenge', {
        ...loggingContext,
        reqStatus: response.status,
      });
      throw data;
    }
  } catch (e) {
    // we need to check if the error thrown was in the try or if an generic error happened
    // if there was a generic error, we need to redirect to the error page
    if (!(e instanceof Error)) {
      const error = e as Auth0ErrorResponse;
      logTrace('Auth0 Error Response', {
        ...loggingContext,
        error: error?.error,
      });
      if (
        error.error === 'invalid_grant' &&
        !error.error_description.includes('mfa_token')
      ) {
        error.error = 'invalid_grant';
        error.error_description = 'This code’s not right. Try again.';
        return error;
      }
    }

    return {
      success: false,
      error: 'bad-response',
      error_description: 'something else went wrong',
    };
  }

  const tokenData = data! as OauthToken;
  // TODO: This function could use a different name, but reusing it to ensure
  // mfa cookies are deleted and access token reset with new stepUp time
  await setLoginCookies(tokenData);
  // We decode this here so that we can pass the stepUpTime back with the
  // success response. We need to set the value on the client side
  // so that client side components are getting the up to date value
  // since the session cookie is stored, decrypted, and retrieved on the server side
  const decodedToken = jose.decodeJwt(tokenData.access_token) as UserClaims;

  logTrace('successful-response::verifyMfaChallenge', {
    ...loggingContext,
  });

  return {
    success: true,
    stepUpTime: decodedToken.stepUpTime,
  };
}
