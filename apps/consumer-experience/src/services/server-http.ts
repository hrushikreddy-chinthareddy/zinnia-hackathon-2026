import { headers } from 'next/headers';
import { v4 as uuid4 } from 'uuid';

import {
  MfaChallengeInputs,
  MfaAssociateInputs,
  MfaSendChallengeInputs,
} from '@/types/auth';
import { Subdomains } from '@/types/carriers';
import { getAccessToken, getSession } from '@/utils/auth';
import {
  CommonLogContext,
  getUserInfoForLogging,
  LoggingModule,
  LoggingStage,
  logTrace,
} from '@/utils/logging/server-logging';
import { AUTH0_SCOPE } from '@/utils/serverClientUtils';
import { getSubdomain } from '@/utils/url';

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
    init?: RequestInit | undefined,
    loggingCtx?: CommonLogContext
  ): Promise<Response> => {
    const correlationId = loggingCtx?.correlationId || uuid4();
    const now = performance.now();
    const { accessToken } = await getAccessToken();
    const loggingContext = {
      user: await getUserInfoForLogging(),
      url: input?.toString(),
      method: init?.method,
      file: 'server-http.ts',
      function: 'request',
    };
    logTrace(
      `${LoggingModule.SERVER_HTTP_REQUEST}::request::${LoggingStage.START}`,
      loggingContext
    );

    const requestInit: RequestInit = init || {};
    if (!requestInit.headers) {
      requestInit.headers = {};
    }

    requestInit.headers = {
      // all backend services should be using this as the way to pass
      // correlationId through the system. Enterprise api at least is
      // definitely using this
      // TODO: verify that bpm is using this header
      // TODO: if not in log, check req body? but then what about GET requests?
      'x-correlation-id': correlationId || uuid4(),
      ...requestInit.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    const result = await fetch(input, requestInit);
    logTrace('server-http::request::complete', {
      ...loggingContext,
      duration: performance.now() - now,
      requestStatus: result.status,
    });
    return result;
  };

  sendVerificationCode = async (email: string) => {
    const subDomain = getSubdomain(headers());
    const isWelb = subDomain === Subdomains.WELLABE;

    return fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/passwordless/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        //  client_id and client_secret here are using wellabe specific variables so that the email with the code
        // has the correct wellabe logo. This is a TEMPORARY change because it's the only way for us to know what
        // subdomain the user is on before sending the email since we do not have access to organizations through
        // this custom auth0 flow. These variables are defined on a separate auth0 application that is a duplicate of
        // the mypolicyview application
        client_id: isWelb ? process.env.AUTH0_CLIENT_ID_WELB : process.env.AUTH0_CLIENT_ID,
        client_secret: isWelb ? process.env.AUTH0_CLIENT_SECRET_WELB : process.env.AUTH0_CLIENT_SECRET,
        connection: 'email',
        email,
        send: 'code'
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

  refreshToken = async () => {
    const session = await getSession();

    return fetch(`${process.env.AUTH0_MANAGEMENT_API_AUDIENCE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        refresh_token: session?.refreshToken,
      }),
    });
  };
}

export const ServerApi = new ServerHttpRequest();
