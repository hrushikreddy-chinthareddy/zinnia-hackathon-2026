export const SESSION_DURATION_IN_MINUTES = 15;
export const SESSION_TIMEOUT_IN_SECONDS = SESSION_DURATION_IN_MINUTES * 60;
export const SESSION_TIMEOUT_IN_MILLISECONDS =
  SESSION_DURATION_IN_MINUTES * 60 * 1000; // 15 minutes in milliseconds;
export const CHECK_SESSION_THRESHOLD = 13 * 60 * 1000; // 13 minutes in milliseconds;
export const MAX_COOKIE_SIZE = 4096;
export const MFA_TOKEN_COOKIE_KEY = '_ztm';
export const MFA_OOB_CODE_COOKIE_KEY = '_ztoob';
export const APP_SESSION_COOKIE_KEY = 'appSession';
export const AGREED_TO_TERMS_AND_CONDITIONS_COOKIE_KEY = '_zttc';
// used to let middleware know the user had a previous session
// if a user had a session and their session is no longer expired they should be redirected to the session page
// see middlare
export const HAD_PREVIOUS_SESSION_COOKIE_KEY = '_s';
export const MOCK_COOKIE_KEY = '..mock..';
export const MOCK_ERROR_COOKIE_KEY = '..mock_error..';
export const SHOW_DEV_MENU_COOKIE_KEY = '..show_dev_menu..';
export interface GetSessionResponse {
  isActiveSession: boolean;
}
export interface PostSessionResponse {
  success: boolean;
}
