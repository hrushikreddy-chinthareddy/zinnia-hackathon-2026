import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { PolicyProfile } from '@/types/policy';

export const getPolicyProfile = async (
  planCode: string,
  policyNumber: string
) => {
  // Why this? Because you get weird invalid URL errors locally. How can we improve this so its more global?
  // https://stackoverflow.com/questions/74966208/next-js-typeerror-failed-to-parse-url-from-api-projects-or-error-connect-econ
  // The only weird thing is that this shouldnt be used server side, so i dont know why it is even throwing the error message about the invalid URL

  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_BASE_URL
      : '';
  const response: ApiResponse<PolicyProfile> = await (
    await ClientApi.get(
      `${baseUrl}/api/policies/${planCode}/${policyNumber}/profile`
    )
  ).json();
  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};
