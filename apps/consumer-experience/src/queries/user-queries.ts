import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';

export const getUserAuthenticationMethods = async () => {
  // TODO: fix type
  const response: ApiResponse<any[]> = await (
    await ClientApi.get('/api/users/authentication-methods')
  ).json();
  if (response.error || !response) {
    throw response.error;
  }
  return response;
};
