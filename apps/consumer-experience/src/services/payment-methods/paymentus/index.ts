import * as jose from 'jose';

import { createSecretKey } from 'crypto';

import { PaymentusProfile } from '@/types/paymentus';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { mockListProfiles } from './__mocks';

const secretKeyString = `${process.env.FARMERS_API_TOKEN_SIGNING_KEY}`;
if (!secretKeyString) {
  throw new Error(
    'FARMERS_API_TOKEN_SIGNING_KEY environment variable is not set.'
  );
}
const secretKey = createSecretKey(secretKeyString, 'utf-8');

const encryptJWT = async () => {
  const jwt = await new jose.SignJWT({
    iss: 'frms',
    requestedScope: ['xotp'],
    requestedTTL: 3600,
  })
    .setProtectedHeader({ alg: 'HS256', kid: '001' })
    .setIssuedAt()
    .sign(secretKey);

  return jwt;
};

export const getPaymentusApiToken = async (): Promise<string> => {
  const url = `${process.env.NEXT_PUBLIC_FARMERS_API_BASE_URL}/api/token/frms`;
  const jwtToken = await encryptJWT();

  const requestBody = new URLSearchParams({ jwt: jwtToken });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching Paymentus API token. Status: ${response.status} ${response.statusText}`
    );
  }
  const data = await response.json();
  if (!data.token) {
    throw new Error('Paymentus API token response did not contain a token.');
  }

  return data.token;
};

export const getPaymentusUserPaymentsList = withLogging(
  async (
    { userId, isMock }: { userId: string; isMock?: boolean },
    _loggingContext: CommonLogContext
  ): Promise<PaymentusProfile[]> => {
    if (isMock) {
      return mockListProfiles['list-profiles-response'].profile;
    }

    const authToken = await getPaymentusApiToken();

    const url = `${process.env.NEXT_PUBLIC_FARMERS_API_BASE_URL}/api/v2/listProfiles/frms/${userId}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching Paymentus user payments list. Status: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    const profiles = data['list-profiles-response'].profile;

    // This is really annoying but the API returns a single profile as an object instead of an array
    // even though the API contract documentation shows it as an array
    return Array.isArray(profiles) ? profiles : [profiles];
  },
  { file: 'paymentus/index.ts', functionName: 'getPaymentusUserPaymentsList' }
);
