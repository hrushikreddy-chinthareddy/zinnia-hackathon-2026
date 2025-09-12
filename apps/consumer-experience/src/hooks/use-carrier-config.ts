import { useQuery } from '@tanstack/react-query';

import { getCarrierConfig } from '@/queries/carrier-config-queries';
import { QueryKeys } from '@/queries/query-keys';

export const useCarrierConfig = () => {
  return useQuery({
    queryKey: [QueryKeys.CARRIER_CONFIG],
    queryFn: () => getCarrierConfig(),
  });
};
