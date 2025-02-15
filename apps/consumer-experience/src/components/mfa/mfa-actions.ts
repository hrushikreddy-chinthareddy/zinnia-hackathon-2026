'use server';

import { redirect } from 'next/navigation';
import { FieldValues } from 'react-hook-form';

import { ServerApi } from '@/services';
import { Auth0ErrorResponse, OauthToken } from '@/types/auth';
import {
  getMfaCookie,
  getOobMfaCookie,
  setLoginCookies,
  setMfaOobCookie,
  setMfaCookie,
} from '@/utils/auth';
import { logTrace, logWarn } from '@/utils/logging/server-logging';

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
      // TODO: what happens here???
      console.log('no mfa token');
    }
  } catch (error) {
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

/**
 * Verifies the MFA challenge for the user.
 *
 * @param {Auth0ErrorResponse} _ - Placeholder parameter for error response from Auth0.
 * @param {FormData} formData - Data containing the code, and enrollment status.
 * @return {Promise<Auth0ErrorResponse | never>} Redirects the user based on the verification result.
 */
export async function verifyMfaChallenge(
  // TODO: fix this type
  mfaData: any
): Promise<Auth0ErrorResponse | never> {
  const loggingContext = {
    file: 'login-actions.ts',
    function: 'verifyMfaChallenge',
  };
  logTrace('start', { ...loggingContext });
  const redirectToErrorPage = false;
  let data: Auth0ErrorResponse | OauthToken;
  try {
    // We need to know if this is an enrollment or not because it changes how we pass the MFA token to auth0
    // for non enrolled user we need to pass the token as an authorization header
    // for enrolled users we pass it as an input to the API
    // const isEnrollment = mfaData.get('isEnrollment')?.toString() === 'true';
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
      isEnrollment: false,
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

  if (redirectToErrorPage) {
    return redirect(`/login/error`);
  }

  const tokenData = data! as OauthToken;
  // TODO: This function could use a different name, but reusing it to ensure
  // mfa cookies are deleted and access token reset with new stepUp time
  await setLoginCookies(tokenData);

  return {
    success: true,
    error: '',
    error_description: '',
  };
}
