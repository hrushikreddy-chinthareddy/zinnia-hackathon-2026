import { usePathname, useParams } from 'next/navigation';

export const useGetBasePolicyPath = () => {
  const { policyNumber } = useParams<{
    policyNumber: string;
  }>();
  const pathName = usePathname();
  const indexOfPolicyNumber = pathName.split('/').indexOf(policyNumber);
  // The cancel url should return to the policy overview page which will
  // be the current url without any path values after the policy number
  const baseUrl = pathName
    .split('/')
    .slice(0, indexOfPolicyNumber + 1)
    .join('/');

  return baseUrl;
};
