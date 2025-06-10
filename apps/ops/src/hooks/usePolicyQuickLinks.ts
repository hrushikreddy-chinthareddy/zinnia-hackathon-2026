import { useQuery } from '@tanstack/react-query';
import { getPolicyQuickLinks } from '@deps/containers/quick-links/quick-links.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { TFunction } from 'i18next';

export const usePolicyQuickLinks = (t: TFunction, policy: PolicyDetails) => {
  return useQuery({
    queryKey: ['quickLinks', policy, t],
    queryFn: () => getPolicyQuickLinks(t, policy),
  });
};