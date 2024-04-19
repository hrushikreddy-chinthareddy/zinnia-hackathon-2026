export const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds;
export const CHECK_SESSION_THRESHOLD = 13 * 60 * 1000; // 13 minutes in milliseconds;
export const MAX_AGE_SESSION_COOKIE = 17 * 60; // 17 minutes - adding a little buffer to allow for auth checks and redirect to happen
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
