/**
 * Client-side logout utilities for handling immediate logout scenarios
 */

/**
 * Immediately redirects the user to the logout endpoint
 * This is useful for client-side components that detect 401 responses
 * and need to log the user out immediately
 */
export const logoutImmediately = (): void => {
  // Use window.location.href for immediate redirect without Next.js router
  // This ensures the logout happens even if the router is in a bad state
  window.location.href = '/api/logout';
};

/**
 * Checks if a response is a 401 Unauthorized and logs out if so
 * @param response - The fetch response to check
 * @returns true if 401 was detected and logout was triggered, false otherwise
 */
export const handleUnauthorizedResponse = (response: Response): boolean => {
  if (response.status === 401) {
    logoutImmediately();
    return true;
  }
  return false;
};

/**
 * Wrapper for fetch that automatically handles 401 responses
 * @param input - The fetch input
 * @param init - The fetch init options
 * @returns Promise<Response>
 */
export const fetchWithAutoLogout = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, init);

  // If we get a 401, logout immediately
  handleUnauthorizedResponse(response);

  return response;
};
