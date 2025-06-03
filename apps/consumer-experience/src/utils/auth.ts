import hkdf from '@panva/hkdf';
import { CookieSerializeOptions, serialize } from 'cookie';
import * as jose from 'jose';
import { NextURL } from 'next/dist/server/web/next-url';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { PartialNextUrl } from '@/types';
import {
  AccessTokenInfo,
  Auth0SessionToken,
  CookieConfig,
  GetAccessTokenResult,
  OauthToken,
  Session,
  SetCookieOptions,
  User,
  UserClaims,
} from '@/types/auth';

import { logWarn } from './logging/server-logging';
import {
  AGREED_TO_TERMS_AND_CONDITIONS_COOKIE_KEY,
  APP_SESSION_COOKIE_KEY,
  CARRIER_COOKIE_KEY,
  HAD_PREVIOUS_SESSION_COOKIE_KEY,
  LOGIN_EMAIL_COOKIE_KEY,
  MAX_COOKIE_SIZE,
  MFA_OOB_CODE_COOKIE_KEY,
  MFA_TOKEN_COOKIE_KEY,
  REFRESH_ROUTER_COOKIE_KEY,
  RETURN_TO_URL_COOKIE_KEY,
  SESSION_TIMEOUT_IN_MILLISECONDS,
} from './serverClientUtils';
const notNull = <T>(value: T | null): value is T => value !== null;
const BYTE_LENGTH = 32;
const ENCRYPTION_INFO = 'JWE CEK';
const digest = 'sha256';
/**
 *
 * Derives appropriate sized keys from the end-user provided secret random string/passphrase using
 * HKDF (HMAC-based Extract-and-Expand Key Derivation Function) defined in RFC 8569.
 *
 * @see https://tools.ietf.org/html/rfc5869
 *
 */
const encryption = (secret: string): Promise<Uint8Array> =>
  hkdf(digest, secret, '', ENCRYPTION_INFO, BYTE_LENGTH);
const epoch = (): number => Math.floor(Date.now() / 1000);
const alg = 'dir';
const enc = 'A256GCM';
/**
 * Encrypts the provided JWTPayload using jose library.
 *
 * @param {jose.JWTPayload} payload - The payload to be encrypted.
 * @return {Promise<string>} A promise that resolves to the encrypted JWT token.
 */
const encrypt = async (payload: jose.JWTPayload): Promise<string> => {
  const key = await encryption(process.env.JWT_SECRET);
  try {
    return await new jose.EncryptJWT({ ...payload })
      .setProtectedHeader({ alg, enc })
      .setIssuedAt()
      .encrypt(key);
  } catch (error) {
    logWarn('error encrypting', { file: 'auth.ts', function: 'encrypt' });
    return '';
  }
};
/**
 * Decrypts a JWT token using the provided JWE string.
 *
 * @param {string} jwe - The JWE string to decrypt.
 * @return {Promise<jose.JWTDecryptResult<Auth0SessionToken>>} A promise that resolves to the decrypted JWT token.
 */
export const decrypt = async (
  jwe: string
): Promise<jose.JWTDecryptResult<OauthToken>> => {
  let err;
  try {
    const key = await encryption(process.env.JWT_SECRET);
    return await jose.jwtDecrypt(jwe, key);
  } catch (e) {
    logWarn('error decrypting', { file: 'auth.ts', function: 'decrypt' });
    err = e;
  }
  throw err;
};
/**
 * Calculates the chunk size based on the provided cookie name and configuration.
 *
 * @param {string} cookieName - The name of the cookie.
 * @param {CookieConfig} cookieConfig - The configuration options for the cookie.
 * @return {Promise<number>} The calculated chunk size.
 */
const getChunkSize = async (
  cookieName: string,
  cookieConfig: CookieConfig
): Promise<number> => {
  const cookieOptions: CookieSerializeOptions = {
    ...cookieConfig,
  };

  if (!cookieConfig.transient) {
    cookieOptions.expires = new Date();
  }

  // this creates a cookie with an empty value. This is needed because a cookie can only be
  // 4096 characters long. This includes the cookie name and options. So we need to see how many characters we have left
  // to fit the value. If we have more than 4096 characters left, we need to split the cookie into multiple chunks.
  const emptyCookie = serialize(`${cookieName}.0`, '', cookieOptions);
  const chunkSize = MAX_COOKIE_SIZE - emptyCookie.length;
  return chunkSize;
};

export const domain =
  process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW ||
  process.env.AUTH0_COOKIE_DOMAIN ||
  process.env.VERCEL_BRANCH_URL;

/**
 * Sets a cookie with the provided options.
 *
 * @param {SetCookieOptions} options - The options for setting the cookie.
 */
export const setCookie = async (options: SetCookieOptions) => {
  const { value, cookieName, res, cookieConfig } = options;
  if (value === undefined || !cookieName) {
    logWarn('error::invalid-args', { file: 'auth.ts', function: 'setCookie' });
    throw new Error("Must supply a 'value' and 'cookieName'");
  }
  const cookieStore = cookies();
  // in some cases, for example in middleware, we can't use the cookies object because it will set the cookie after the response has been sent
  // so we need to set the cookie on the response object.
  const cookieResponse = res?.cookies ?? cookieStore;

  const cookieOptions: CookieConfig = {
    secure: process.env.AUTH0_COOKIE_SECURE === 'true',
    sameSite: 'lax',
    httpOnly: false,
    transient: false,
    path: '/',
    domain,
    ...cookieConfig,
  };
  const existingCookies = new Set(
    cookieStore
      .getAll()
      .filter(cookie => cookie.name.match(`^${cookieName}(?:\\.\\d)?$`))
      .map(cookie => cookie.name)
  );
  const chunkSize = await getChunkSize(cookieName, cookieOptions);
  // if the value passed in is an empty string that means we want to delete an existing cookie
  // if that is the case we can check the size of the existing cookie and use that has the chunkCount
  // because the cookie already exists.
  const chunkCount =
    value === '' && existingCookies.size > 0
      ? existingCookies.size
      : Math.ceil(value.length / chunkSize);

  if (chunkCount > 1) {
    for (let i = 0; i < chunkCount; i++) {
      const chunkValue = value.slice(i * chunkSize, (i + 1) * chunkSize);
      const chunkCookieName = `${cookieName}.${i}`;
      cookieResponse.set(chunkCookieName, chunkValue, cookieOptions);
      existingCookies.delete(chunkCookieName);
    }
  } else {
    cookieResponse.set(cookieName, value, cookieOptions);
    existingCookies.delete(cookieName);
  }

  // When the number of chunks changes due to the cookie size changing,
  // you need to delete any obsolete cookies.
  existingCookies.forEach(cookie => {
    cookieResponse.delete(cookie);
  });
};
/**
 * Retrieves the value of a cookie with the provided name.
 *
 * @param {string} cookieName - The name of the cookie to retrieve.
 * @return {Promise<string | undefined>} The value of the cookie if found, otherwise undefined.
 */
export const getCookie = async (
  cookieName: string
): Promise<string | undefined> => {
  const cookieStore = cookies();
  let existingSessionValue: string | undefined;
  if (cookieStore.has(cookieName)) {
    existingSessionValue = cookieStore.get(cookieName)?.value;
  } else if (cookieStore.has(`${cookieName}.0`)) {
    // if we get here that means the cookie was split into multiple chunks
    // we need to join them back together
    // and sorting them by index will put them in the correct order
    existingSessionValue = cookieStore
      .getAll()
      .map(cookie => {
        const match = cookie.name.match(`^${cookieName}(?:\\.\\d)?$`);
        if (match) {
          const index = cookie.name.split('.')[1];
          return [index, cookie.value];
        }
        return null;
      })
      .filter(notNull)
      .sort(([a], [b]) => {
        return parseInt(a || '', 10) - parseInt(b || '', 10);
      })
      .map(([, chunk]) => {
        return chunk;
      })
      .join('');
  }
  return existingSessionValue;
};
export const getMfaCookie = async () => {
  return getCookie(MFA_TOKEN_COOKIE_KEY);
};
export const getOobMfaCookie = async () => {
  return getCookie(MFA_OOB_CODE_COOKIE_KEY);
};

export const setMfaCookie = async (cookieConfig: SetCookieOptions) => {
  cookieConfig.cookieName = MFA_TOKEN_COOKIE_KEY;
  await setCookie(cookieConfig);
};

export const setMfaOobCookie = async (cookieConfig: SetCookieOptions) => {
  cookieConfig.cookieName = MFA_OOB_CODE_COOKIE_KEY;
  await setCookie(cookieConfig);
};
/**
 * Retrieves the session information based on the existing session value.
 *
 * @param {NextResponse} res - Optional NextResponse object for handling the response
 * @return {Promise<Session | undefined>} Returns a Promise resolving to a Session object or undefined
 */
export const getSession = async (
  res?: NextResponse
): Promise<Session | undefined> => {
  try {
    const existingSessionValue = await getCookie(APP_SESSION_COOKIE_KEY);
    if (existingSessionValue) {
      const hasSignedTermsAndConditions =
        (await getCookie(AGREED_TO_TERMS_AND_CONDITIONS_COOKIE_KEY)) === 'true';
      const { payload } = await decrypt(existingSessionValue);
      // This article is super helpful in terms of understanding the difference between
      // these two tokens: https://auth0.com/blog/id-token-access-token-what-is-the-difference/
      const { access_token, id_token } = payload;
      const userClaims = jose.decodeJwt(id_token) as UserClaims;
      const user: User = {
        ...userClaims,
        hasSignedTermsAndConditions,
      };
      const sessionValues = jose.decodeJwt(access_token) as AccessTokenInfo;
      const accessTokenExpiresAt = sessionValues.exp;
      const currentTime = epoch();

      if (currentTime > accessTokenExpiresAt) {
        await deleteSession(res);
        return;
      }

      const session: Session = {
        user,
        idToken: id_token,
        accessToken: access_token,
        accessTokenExpiresAt,
        accessTokenScope: sessionValues.scope,
        refreshToken: payload.refresh_token,
      };
      return session;
    }
  } catch (error) {
    logWarn('unknown-error', {
      file: 'auth.ts',
      function: 'getSession',
      error,
    });
    await deleteSession(res);
    return;
  }
};

export const getAccessToken = async (
  res?: NextResponse
): Promise<GetAccessTokenResult> => {
  const session = await getSession(res);
  return { accessToken: session?.accessToken };
};

export const deleteCookie = async (cookieName: string, res?: NextResponse) => {
  const cookie = await getCookie(cookieName);
  if (cookie) {
    const setCookieOptions: SetCookieOptions = {
      cookieName: cookieName,
      value: '',
      res,
      cookieConfig: {
        expires: new Date(0),
        httpOnly: cookieName === APP_SESSION_COOKIE_KEY,
      },
    };
    setCookie(setCookieOptions);
  }
};

export const deleteSession = async (res?: NextResponse) => {
  await deleteCookie(APP_SESSION_COOKIE_KEY, res);
  await deleteCookie(AGREED_TO_TERMS_AND_CONDITIONS_COOKIE_KEY, res);
  await deleteCookie(RETURN_TO_URL_COOKIE_KEY, res);
  await deleteCookie(REFRESH_ROUTER_COOKIE_KEY, res);
  await deleteCookie(CARRIER_COOKIE_KEY, res);
};
/**
 * Sets a session cookie with the provided token and response object.
 *
 * @param {OauthToken} token - Optional token to set the cookie value
 * @param {NextResponse} res - Optional response object
 */
export const setSessionCookie = async (
  token?: OauthToken,
  res?: NextResponse
) => {
  let cookieVal: string;

  // if no token is provided, use the existing session
  // this is used mostly for when you want to update a session: See touchSession
  if (token) {
    cookieVal = await encrypt({ ...token });
  } else {
    cookieVal = (await getCookie(APP_SESSION_COOKIE_KEY)) || '';
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_TIMEOUT_IN_MILLISECONDS);
  const setCookieOptions: SetCookieOptions = {
    cookieName: APP_SESSION_COOKIE_KEY,
    value: cookieVal,
    res,
    cookieConfig: {
      httpOnly: true,
      expires,
    },
  };
  await setCookie(setCookieOptions);
};

export const setLoginCookies = async (
  token?: OauthToken,
  res?: NextResponse
) => {
  await setSessionCookie(token, res);
  // this cookie is needed when a user is logged in and we need to redirect to the session timeout page when their session expires
  // if a user is not loged in then we can send them to the login page or 404 page
  await setCookie({
    cookieName: HAD_PREVIOUS_SESSION_COOKIE_KEY,
    value: '1',
    res,
  });
  await deleteCookie(MFA_OOB_CODE_COOKIE_KEY, res);
  await deleteCookie(MFA_TOKEN_COOKIE_KEY, res);
  await deleteCookie(LOGIN_EMAIL_COOKIE_KEY, res);
};

export const touchSession = async (res?: NextResponse) => {
  const session = await getSession();
  if (session) {
    await setSessionCookie(undefined, res);
  }
};

export const setTermsAndConditionsCookie = async (
  val: boolean,
  res?: NextResponse
) => {
  await setCookie({
    cookieName: AGREED_TO_TERMS_AND_CONDITIONS_COOKIE_KEY,
    value: val.toString(),
    res,
  });
};

export const getReturnUrlCookie = async (): Promise<
  PartialNextUrl | undefined
> => {
  const cookie = await getCookie(RETURN_TO_URL_COOKIE_KEY);
  if (cookie) {
    try {
      return JSON.parse(cookie);
    } catch (error) {
      return;
    }
  }

  return;
};

export const setReturnUrlCookie = async (
  nextUrl: NextURL,
  res?: NextResponse
) => {
  const value: PartialNextUrl = {
    hostname: nextUrl.hostname,
    href: nextUrl.href,
    pathname: nextUrl.pathname,
    search: nextUrl.search,
  };
  await setCookie({
    cookieName: RETURN_TO_URL_COOKIE_KEY,
    value: JSON.stringify(value),
    res,
  });
};

/**
 * NextJS caches route information client side so they can route quicker
 * If the user enters a friend url such as /riders and has multiple policies we send them to the policies index page first
 * after they select a policy we redirect them to the riders page.
 * The issue with that is NextJS stores a cache of data and routes on the client side
 * and if the URL is redirected it maps the original URL to the new url
 * for example if the user select /policies/SBFIXUL1/AU22006467 and we redirect them to /policies/SBFIXUL1/AU22006467/riders
 * NextJS will also router /policies/SBFIXUL1/AU22006467 to /policies/SBFIXUL1/AU22006467/riders because it a temporary redirect.
 * In order to correct this we set a refresh cookie that allows the frontend to clear the route cache in these scenarios
 * see RefreshRouterManager.tsx
 */
export const setRefreshRouterCookie = async (res?: NextResponse) => {
  await setCookie({
    value: '1',
    cookieName: REFRESH_ROUTER_COOKIE_KEY,
    res,
  });
};
