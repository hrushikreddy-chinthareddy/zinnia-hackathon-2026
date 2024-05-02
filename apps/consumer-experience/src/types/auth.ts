import { NextResponse } from 'next/server';

export interface OauthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token: string;
}

export interface PasswordlessStartSuccessResponse {
  _id: string;
  email: string;
  email_verified: boolean;
}

export interface Auth0ErrorResponse {
  error: string;
  error_description: string;
  mfa_token?: string;
}

export interface PasswordlessCodeMfaResponse {
  mfaIsEnabled: boolean | null;
}

export interface MfaAuthenticator {
  id: string;
  name?: string;
  oob_channel?: string;
  authenticator_type: string;
  active: boolean;
}

export interface MfaAssociateInputs {
  authenticatorType: string;
  phoneNumber?: string;
}

export interface MfaAssoicateResponse {
  authenticator_type: string;
  binding_method: string;
  recovery_codes: string[];
  oob_channel: string;
  oob_code: string;
}

export interface CookieConfig {
  /**
   * Domain name for the cookie.
   * Passed to the [response cookie](https://expressjs.com/en/api.html#res.cookie) as `domain`.
   */
  domain?: string;

  /**
   * Path for the cookie.
   * Passed to the [response cookie](https://expressjs.com/en/api.html#res.cookie) as `path`.
   */
  path?: string;

  /**
   * Set to `true` to use a transient cookie (cookie without an explicit expiration).
   * Defaults to `false`.
   */
  transient?: boolean;

  /**
   * Flags the cookie to be accessible only by the web server.
   * Passed to the [response cookie](https://expressjs.com/en/api.html#res.cookie) as `httponly`.
   * Defaults to `true`.
   */
  httpOnly?: boolean;

  /**
   * Marks the cookie to be used over secure channels only.
   * Passed to the [response cookie](https://expressjs.com/en/api.html#res.cookie) as `secure`.
   * Defaults to the protocol of {@link Config.baseURL}.
   */
  secure?: boolean;

  /**
   * Value of the SameSite `Set-Cookie` attribute.
   * Passed to the [response cookie](https://expressjs.com/en/api.html#res.cookie) as `samesite`.
   * Defaults to `Lax` but will be adjusted based on {@link AuthorizationParameters.response_type}.
   */
  sameSite?: 'lax' | 'strict' | 'none';
  expires?: Date | undefined;
  maxAge?: number | undefined;
}

export interface MfaChallengeInputs {
  mfaToken: string;
  oobCode: string;
  bindingCode: string;
  isEnrollment: boolean;
}

export interface MfaSendChallengeInputs {
  mfaToken: string;
  challengeType: string;
  authenticatorId: string;
}

export interface MfaChallengeResponse {
  challenge_type: string;
  oob_code: string;
  binding_method: string;
}

export interface SetCookieOptions {
  value?: string;
  cookieName?: string;
  res?: NextResponse;
  cookieConfig?: CookieConfig;
}

export type JoseJwtProtectedHeader = {
  iat: number;
  uat: number;
  exp: number;
  [propName: string]: unknown;
};

export interface GetAccessTokenResult {
  accessToken?: string | undefined;
}

export interface Auth0SessionToken {
  oauthToken: OauthToken;
}

export interface Permissions {
  [key: string]: string[];
}

export interface UserClaims {
  'https://dev.api.zinnia.io/permissions': Permissions;
  partyId: string;
  app_metadata: object;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  sub: string;
  sid: string;
}

export interface User extends UserClaims {
  hasSignedTermsAndConditions: boolean;
}

export interface Session {
  /**
   * Any of the claims from the `id_token`.
   */
  user: User;

  /**
   * The ID token.
   */
  idToken?: string | undefined;

  /**
   * The access token.
   */
  accessToken?: string | undefined;

  /**
   * The access token scopes.
   */
  accessTokenScope?: string | undefined;

  /**
   * The expiration of the access token.
   */
  accessTokenExpiresAt?: number;

  /**
   * The refresh token, which is used to request a new access token.
   *
   * **IMPORTANT** You need to request the `offline_access` scope on login to get a refresh token
   * from Auth0.
   */
  refreshToken?: string | undefined;
}

export interface AccessTokenInfo {
  'https://dev.api.zinnia.io/email': string;
  'https://dev.api.zinnia.io/clientIds': string[];
  'https://dev.api.zinnia.io/permissions': string[];
  partyId: string;
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  scope: string;
  gty: string;
  azp: string;
}

export interface MfaResendChallangeResponse {
  success: boolean | null;
}

export interface UserContext {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
}

export interface TermsAndConditionApiResponse {
  partyId: string;
  agreedToTermsAndConditions: boolean;
  dateCreated: string;
  id: string;
}
