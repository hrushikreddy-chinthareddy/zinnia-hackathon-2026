import { useQuery } from '@tanstack/react-query';

import { getComponentVisibilityQuery } from '@/queries/component-visibility-queries';
import { QueryKeys } from '@/queries/query-keys';

export const useComponentVisibility = (
  planCode: string,
  policyNumber: string
) => {
  return useQuery({
    queryKey: [QueryKeys.COMPONENT_VISIBILITY, planCode, policyNumber],
    queryFn: () => {
      return getComponentVisibilityQuery(planCode, policyNumber);
    },
  });
};
