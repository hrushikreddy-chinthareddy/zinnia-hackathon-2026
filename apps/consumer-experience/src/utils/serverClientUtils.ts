// zt in the cookie name mean "zinnia tech"
export const SESSION_DURATION_IN_MINUTES = Number(
  process.env.SESSION_DURATION_IN_MINUTES || 15
);
export const SESSION_TIMEOUT_IN_SECONDS = SESSION_DURATION_IN_MINUTES * 60;
export const SESSION_TIMEOUT_IN_MILLISECONDS =
  SESSION_DURATION_IN_MINUTES * 60 * 1000; // 15 minutes in milliseconds;
export const CHECK_SESSION_THRESHOLD =
  Number(process.env.CHECK_SESSION_THRESHOLD_IN_MINUTES || 13) * 60 * 1000; // 13 minutes in milliseconds;
export const MAX_COOKIE_SIZE = 4096;
export const MFA_TOKEN_COOKIE_KEY = '_ztm';
export const MFA_OOB_CODE_COOKIE_KEY = '_ztoob';
export const APP_SESSION_COOKIE_KEY = process.env.AUTH0_SESSION_NAME;
export const AGREED_TO_TERMS_AND_CONDITIONS_COOKIE_KEY = '_zttc';
export const RETURN_TO_URL_COOKIE_KEY = 'returnTo';
export const REFRESH_ROUTER_COOKIE_KEY = 'refreshRouter';
export const CARRIER_COOKIE_KEY = 'refreshRouter';
export const FROM_LOGIN_QUERY_KEY = 'fromLogin';
export const AUTH0_SCOPE = process.env.AUTH0_SCOPE;
// used to let middleware know the user had a previous session
// if a user had a session and their session is no longer expired they should be redirected to the session page
// see middleware
export const HAD_PREVIOUS_SESSION_COOKIE_KEY = '_ztps';
export const MOCK_COOKIE_KEY = '..mock..';
export const MOCK_ERROR_COOKIE_KEY = '..mock_error..';
export const MOCK_EMPTY_BANK_DETAILS = '..mock_empty_bank_details..';
export const SHOW_DEV_MENU_COOKIE_KEY = '..show_dev_menu..';
export const SHOW_TEST_POLICIES_COOKIE_KEY = '..show_test_policies..';
export const MOCK_ANNUITY_COOKIE_KEY = '..mock_annuity..';
export const THEME_COOKIE = '..theme..';

export interface GetSessionResponse {
  isActiveSession: boolean;
}
export interface PostSessionResponse {
  success: boolean;
}
