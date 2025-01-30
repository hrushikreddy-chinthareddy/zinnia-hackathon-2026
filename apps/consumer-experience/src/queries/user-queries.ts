import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { UserAuthenticationMethod } from '@/types/auth';

export const getUserAuthenticationMethods = async () => {
  const response: ApiResponse<UserAuthenticationMethod[]> = await (
    await ClientApi.get('/api/users/authentication-methods')
  ).json();
  if (response.error || !response) {
    throw response.error;
  }
  console.log('response in query', response);
  return response;
};
