import { headers } from 'next/headers';
import { v4 as uuid4 } from 'uuid';

import {
  MfaChallengeInputs,
  MfaAssociateInputs,
  MfaSendChallengeInputs,
} from '@/types/auth';
import { getAccessToken, getSession } from '@/utils/auth';
import {
  getUserInfoFromSession,
  logTrace,
} from '@/utils/logging/server-logging';
import { AUTH0_SCOPE } from '@/utils/serverClientUtils';

import { HttpRequest } from './http';

function getIp() {
  const FALLBACK_IP_ADDRESS = '0.0.0.0';
  const forwardedFor = headers().get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS;
}

class ServerHttpRequest extends HttpRequest {
  request = async (
    input: string | URL | Request,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    const correlationId = uuid4();
    const now = performance.now();
    const { accessToken } = await getAccessToken();
    console.log({ accessToken });
    const session = await getSession();
    const loggingContext = {
      ...getUserInfoFromSession(session),
      url: input?.toString(),
      method: init?.method,
      correlationId,
      file: 'server-http.ts',
      function: 'request',
    };
    logTrace('request::start', loggingContext);

    const requestInit: RequestInit = init || {};
    if (!requestInit.headers) {
      requestInit.headers = {};
    }

    requestInit.headers = {
      'x-correlation-id': correlationId,
      ...requestInit.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    const result = await fetch(input, requestInit);
    logTrace('request::complete', {
      ...loggingContext,
      duration: performance.now() - now,
      requestStatus: result.status,
    });
    return result;
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
        'auth0-forwarded-for': getIp(),
      },
      cache: 'no-store',
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        realm: 'email',
        scope: AUTH0_SCOPE,
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
