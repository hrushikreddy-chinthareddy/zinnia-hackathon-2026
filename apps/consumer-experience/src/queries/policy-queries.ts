import { ClientApi } from '@/services/client-http';
import { PolicyProfile } from '@/types/policy';

export const getPolicyProfile = async (
  planCode: string,
  policyNumber: string
) => {
  const { data }: { data: PolicyProfile } = await (
    await ClientApi.get(`/api/policies/${planCode}/${policyNumber}`)
  ).json();
  return data;
};
