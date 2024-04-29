'use server';
import { RedirectType, redirect } from 'next/navigation';

import { ServerApi } from '@/services';
import {
  Auth0ErrorResponse,
  MfaAssoicateResponse,
  MfaAuthenticator,
  MfaChallengeResponse,
  MfaResendChallangeResponse,
  OauthToken,
  PasswordlessCodeMfaResponse,
} from '@/types/auth';
import {
  getMfaCookie,
  getOobMfaCookie,
  setLoginCookies,
  setMfaCookie,
  setMfaOobCookie,
} from '@/utils/auth';
/**
 * Initiates the passwordless authentication process by sending a verification code to the provided email.
 *
 * @param {Auth0ErrorResponse} _ - Placeholder parameter for error response from Auth0.
 * @param {FormData} formData - Data containing the email for verification.
 * @return {Promise<Auth0ErrorResponse | never>} If successful, redirects to the passwordless email challenge page; otherwise, returns an error object with details.
 */
export async function passwordlessStart(
  _: Auth0ErrorResponse,
  formData: FormData
): Promise<Auth0ErrorResponse | never> {
  const email = formData.get('email')?.toString() || '';
  let redirectToErrorPage = false;

  if (!email) {
    return {
      error: 'bad.email',
      error_description: 'Please enter your email.',
    };
  }

  try {
    const response = await ServerApi.sendVerificationCode(email);
    const data = await response.json();

    if (response.status !== 200) {
      throw data;
    }
  } catch (e: unknown | Auth0ErrorResponse) {
    // redirect if we get an unknown error that wasn't thrown by Auth0. In this case let's start the process over
    // TODO: LOGGING need to log to datadog
    redirectToErrorPage = true;
    // TODO: LOGGING need to log to datadog
    // we need to check if the error thrown was in the try or if an generic error happened
    // if there was a generic error, we need to redirect to the error page
    if (!(e instanceof Error)) {
      const error = e as Auth0ErrorResponse;
      if (error.error === 'bad.email') {
        error.error = 'bad.email';
        error.error_description = 'Looks like there’s a typo in your email.';
        return error;
      } else if (error.error === 'bad.connection') {
        // TODO: LOGGING need to log to datadog
        // redirect to challenge page as to not let the user know the email doesn't exist
        // We don't want to give them hints if it happens to be a hacker
        redirectToErrorPage = false;
      }
    }
  }

  if (redirectToErrorPage) {
    return redirect(`/login/error`);
  }

  return redirect(
    `/login/passwordless-email-challenge?email=${encodeURIComponent(email)}`,
    RedirectType.replace
  );
}
/**
 * Initiates the resend of the verification code by sending a new code to the provided email.
 *
 * @param {Auth0ErrorResponse | { success: boolean }} _ - Placeholder parameter for error response or success flag.
 * @param {FormData} formData - Data containing the email for verification.
 * @return {Promise<Auth0ErrorResponse | { success: boolean }>} If successful, returns success flag; otherwise, returns an error object with details.
 */
export async function resendVerificationCode(
  _: Auth0ErrorResponse | { success: boolean },
  formData: FormData
): Promise<Auth0ErrorResponse | { success: boolean }> {
  const email = formData.get('email')?.toString() || '';

  if (!email) {
    return {
      error: 'bad.email',
      error_description: 'Please enter your email.',
    };
  }

  try {
    const response = await ServerApi.sendVerificationCode(email);
    const data = await response.json();

    if (response.status !== 200) {
      throw data;
    }

    return {
      success: true,
    };
  } catch (e: unknown | Auth0ErrorResponse) {
    return {
      // TODO: LOGGING need to log to datadog
      error: 'bad.connection',
      error_description: 'Unable to send verification code. Please try again.',
    };
  }
}
/**
 * Initiates the verification of a passwordless start challenge.
 *
 * @param {Auth0ErrorResponse} _ - Placeholder parameter for error response from Auth0.
 * @param {FormData} formData - Data containing the email and code for verification.
 * @return {Promise<Auth0ErrorResponse | never>} If successful, redirects to the appropriate challenge page based on the verification result; otherwise, returns an error object with details.
 */
export async function verifyPasswordlessStartChallenge(
  _: Auth0ErrorResponse,
  formData: FormData
): Promise<Auth0ErrorResponse | never> {
  const email = formData.get('email')?.toString() || '';
  const code = formData.get('code')?.toString() || '';
  let data: Auth0ErrorResponse | PasswordlessCodeMfaResponse | OauthToken;
  let redirectToErrorPage = false;
  if (code.length < 6) {
    return {
      error: 'bad.reuqest',
      error_description: 'Code must be 6 digits.',
    };
  }

  try {
    const response = await ServerApi.verifyPasswordlessStartChallenge({
      email,
      code,
    });
    data = await response.json();

    // Auth0 treats mfa_required as an error, however we need to treat it as a success so we can redirect to the MFA pages.
    // IF the response is a 200 that means AMFA was successful and we will get back an access code
    // IF we don't get don't one of those responses, we need to redirect to the error page
    // or we got an invalid code
    if (!('mfa_token' in data && data.mfa_token) && response.status !== 200) {
      throw data;
    }
  } catch (e: unknown | Auth0ErrorResponse) {
    // we need to check if the error thrown was in the try or if an generic error happened
    // if there was a generic error, we need to redirect to the error page
    if (!(e instanceof Error)) {
      const error = e as Auth0ErrorResponse;

      if (error.error === 'invalid_grant') {
        const error: Auth0ErrorResponse = {
          error: 'invalid_grant',
          error_description: 'This code’s not right. Try again.',
        };
        return error;
      }
    }

    redirectToErrorPage = true;
  }

  if (redirectToErrorPage) {
    return redirect(`/login/error`);
  }

  // check if we have an MFA token. If we do we need to show the MFA process
  // data can be an MfaCodeMfaResponse or an OauthToken so we need to check which one it is so we cast it
  if ('mfa_token' in data! && data.mfa_token) {
    // the mfa token is needed to send the mfa challenge
    await setMfaCookie({
      value: data.mfa_token,
    });
    const mfaToken = data.mfa_token;
    // next we need to check if we should send the user to the challenge page or the enrollment page
    // The was we do that is to check if they have any active authenticators
    const authenticatorsRequest =
      await ServerApi.getMfaAuthenticators(mfaToken);
    const authenticatorsResponse = await authenticatorsRequest.json();

    if (authenticatorsRequest.status === 200) {
      const authenticators = authenticatorsResponse as MfaAuthenticator[];

      if (authenticators.length) {
        // Current we only support sms or voice AND the authenticator needs to be active
        const authenticator = authenticators.find(
          a => ['voice', 'sms'].includes(a.oob_channel || '') && a.active
        );
        if (authenticator) {
          const sendMfaChallengeResponse = await ServerApi.sendMfaChallenge({
            mfaToken,
            challengeType: authenticator.authenticator_type,
            authenticatorId: authenticator.id,
          });
          const data = await sendMfaChallengeResponse.json();

          if (sendMfaChallengeResponse.status === 200) {
            const challengeData = data as MfaChallengeResponse;
            // the OOB code is needed to send the mfa challenge
            await setMfaOobCookie({
              value: challengeData.oob_code,
            });
            return redirect(`/login/mfa/mfa-challenge`);
          }
          // if we get here we have an unknown error and we need to start the process again
          // redirect to the error page where all the cookies that were set will be deleted and we will prompt the user to try again
          return redirect(`/login/error`);
        }
      }
    }
    // if we get here that means the user does not have any active authenticators and they need to enroll in MFA
    return redirect(`/login/mfa/mfa-enrollment`);
  }

  // if we get here that the user passed the AMFA risk assessment (done by auth0) and we can log them in without MFA
  const tokenData = data! as OauthToken;
  await setLoginCookies(tokenData);
  return redirect(`/policies`);
}
/**
 * Async function to associate MFA with the provided form data.
 *
 * @param {Auth0ErrorResponse} _ - Placeholder for unused parameter
 * @param {FormData} formData - The form data containing authenticator type, phone number, and country code
 * @return {Promise<Auth0ErrorResponse | never>} If successful, redirect to the MFA challenge page; otherwise, returns an error object with details or redirec to the error page.
 */
export async function associateMfa(
  _: Auth0ErrorResponse,
  formData: FormData
): Promise<Auth0ErrorResponse | never> {
  let redirectToErrorPage = false;
  let data:
    | Auth0ErrorResponse
    | (MfaAssoicateResponse & { phoneNumber: string })
    | MfaAssoicateResponse;
  const authenticatorType = formData.get('authenticatorType')?.toString() || '';
  const phoneNumber = (formData.get('phoneNumber')?.toString() || '').replace(
    /\D/g,
    ''
  );
  const countryCode = formData.get('countryCode')?.toString() || '';
  try {
    const mfaToken = await getMfaCookie();
    // if somehow we get here and we do not have an MFA token we throw an error
    // the error capture will set reDirectToErrorPage to true and redirect to the error page
    if (!mfaToken) {
      throw new Error('No MFA token was found.');
    }

    if (phoneNumber.length < 10) {
      return {
        error: 'bad.request',
        error_description: 'Phone number must be 10 digits.',
      };
    }

    const response = await ServerApi.associateMfa(mfaToken, {
      authenticatorType,
      phoneNumber: `${countryCode}${phoneNumber}`,
    });
    data = await response.json();

    if (response.status !== 200) {
      throw data;
    }
  } catch (error) {
    // if we get here an error was thrown we do not know how to handle
    // redirect to the error page and start the process over
    redirectToErrorPage = true;
  }

  if (redirectToErrorPage) {
    return redirect(`/login/error`);
  }

  const mfaData = data! as MfaAssoicateResponse;
  await setMfaOobCookie({
    value: mfaData.oob_code,
  });

  const id = `${mfaData.oob_channel}|${phoneNumber.slice(-4)}`;
  return redirect(`/login/mfa/mfa-challenge?enrollment=true&id=${id}`);
}
/**
 * Verifies the MFA challenge for the user.
 *
 * @param {Auth0ErrorResponse} _ - Placeholder parameter for error response from Auth0.
 * @param {FormData} formData - Data containing the code, and enrollment status.
 * @return {Promise<Auth0ErrorResponse | never>} Redirects the user based on the verification result.
 */
export async function verifyMfaChallenge(
  _: Auth0ErrorResponse,
  formData: FormData
): Promise<Auth0ErrorResponse | never> {
  let redirectToErrorPage = false;
  let data: Auth0ErrorResponse | OauthToken;
  try {
    // We need to know if this is an enrollment or not because it changes how we pass the MFA token to auth0
    // for non enrolled user we need to pass the token as an authorization header
    // for enrolled users we pass it as an input to the API
    const isEnrollment = formData.get('isEnrollment')?.toString() === 'true';
    const mfaToken = await getMfaCookie();
    const code = formData.get('code')?.toString() || '';
    const oobCode = await getOobMfaCookie();
    // if somehow we get here and we do not have an MFA or OOBCode token we throw an error
    // the error capture will set reDirectToErrorPage to true and redirect to the error page
    if (!mfaToken || !oobCode) {
      throw new Error('No MFA or OOB Token found');
    }

    if (code.length < 6) {
      return {
        error: 'bad.reuqest',
        error_description: 'Code must be 6 digits.',
      };
    }

    const response = await ServerApi.verifyMfaChallenge({
      mfaToken,
      bindingCode: code,
      oobCode,
      isEnrollment,
    });

    data = await response.json();
    if (response.status !== 200) {
      throw data;
    }
  } catch (e) {
    // we need to check if the error thrown was in the try or if an generic error happened
    // if there was a generic error, we need to redirect to the error page
    if (!(e instanceof Error)) {
      const error = e as Auth0ErrorResponse;
      if (
        error.error === 'invalid_grant' &&
        !error.error_description.includes('mfa_token')
      ) {
        error.error = 'invalid_grant';
        error.error_description = 'This code’s not right. Try again.';
        return error;
      }
    }
    redirectToErrorPage = true;
  }

  if (redirectToErrorPage) {
    return redirect(`/login/error`);
  }

  const tokenData = data! as OauthToken;
  await setLoginCookies(tokenData);
  return redirect(`/policies`);
}

export async function resendMfaChallenge(
  _: MfaResendChallangeResponse,
  formData: FormData
): Promise<MfaResendChallangeResponse> {
  try {
    const mfaToken = (await getMfaCookie()) || '';
    const challengeType = formData.get('challengeType')?.toString() || '';
    const authenticatorId = formData.get('authenticatorId')?.toString() || '';
    const response = await ServerApi.sendMfaChallenge({
      authenticatorId,
      challengeType,
      mfaToken,
    });
    const data = await response.json();

    if (response.status === 200) {
      await setMfaOobCookie({
        value: data.oob_code,
      });
      return {
        success: true,
      };
    }
    throw data;
  } catch (error) {
    return {
      success: false,
    };
  }
}
