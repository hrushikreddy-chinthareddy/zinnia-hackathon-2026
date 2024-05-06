import {
  MfaChallengeInputs,
  MfaAssociateInputs,
  MfaSendChallengeInputs,
} from '@/types/auth';
import { getAccessToken } from '@/utils/auth';

import { HttpRequest } from './http';

class ServerHttpRequest extends HttpRequest {
  request = async (
    input: string | URL | Request,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    const { accessToken } = await getAccessToken();

    const requestInit: RequestInit = init || {};
    if (!requestInit.headers) {
      requestInit.headers = {};
    }

    requestInit.headers = {
      ...requestInit.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    return fetch(input, requestInit);
  };

  sendVerificationCode = async (email: string) => {
    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/passwordless/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        connection: 'email',
        email,
        send: 'code',
      }),
    });
  };

  verifyPasswordlessStartChallenge = async ({
    email,
    code,
  }: {
    email: string;
    code: string;
  }) => {
    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        realm: 'email',
        scope: 'openid profile email offline_access',
        username: email,
        otp: code,
      }),
    });
  };

  getMfaAuthenticators = async (mfaToken: string) => {
    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/mfa/authenticators`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mfaToken}`,
      },
      cache: 'no-store',
    });
  };

  associateMfa = async (mfaToken: string, inputs: MfaAssociateInputs) => {
    const { authenticatorType, phoneNumber } = inputs;
    const body = {
      authenticator_types: ['oob'],
      oob_channels: [authenticatorType],
      phone_number: phoneNumber,
    };
    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/mfa/associate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mfaToken}`,
      },
      cache: 'no-store',
      body: JSON.stringify(body),
    });
  };

  sendMfaChallenge = async (inputs: MfaSendChallengeInputs) => {
    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/mfa/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        mfa_token: inputs.mfaToken,
        challenge_type: inputs.challengeType,
        authenticator_id: inputs.authenticatorId,
      }),
    });
  };

  enrollMfa = async (inputs: MfaChallengeInputs) => {
    const formData = new URLSearchParams({
      grant_type: 'http://auth0.com/oauth/grant-type/mfa-oob',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      mfa_token: inputs.mfaToken,
      oob_code: inputs.oobCode,
      binding_code: inputs.bindingCode,
    });
    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      cache: 'no-store',
      body: formData.toString(),
    });
  };

  verifyMfaChallenge = async (inputs: MfaChallengeInputs) => {
    const formData = new URLSearchParams({
      grant_type: 'http://auth0.com/oauth/grant-type/mfa-oob',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      mfa_token: inputs.mfaToken,
      oob_code: inputs.oobCode,
      binding_code: inputs.bindingCode,
    });
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (inputs.isEnrollment) {
      headers.authorization = `Bearer ${inputs.mfaToken}`;
    }

    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers,
      cache: 'no-store',
      body: formData.toString(),
    });
  };
}

export const ServerApi = new ServerHttpRequest();
