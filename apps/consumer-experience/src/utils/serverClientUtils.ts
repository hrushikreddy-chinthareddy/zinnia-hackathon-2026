export const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds;
export const CHECK_SESSION_THRESHOLD = 13 * 60 * 1000; // 13 minutes in milliseconds;
export const MAX_AGE_SESSION_COOKIE = 17 * 60; // 17 minutes - adding a little buffer to allow for auth checks and redirect to happen
export const REDIRECT_TO_SESSION_COOKIE_KEY = 'redirectToSession';
export interface GetSessionResponse {
  isActiveSession: boolean;
}
export interface PostSessionResponse {
  success: boolean;
}
