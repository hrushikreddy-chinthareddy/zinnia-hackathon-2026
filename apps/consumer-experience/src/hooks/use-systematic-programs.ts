import { useQuery } from '@tanstack/react-query';

import { getAllSystematicPrograms } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { FIFTEEN_MINUTES_IN_MS } from '@/utils/numbers';

import { usePolicyUrlInputs } from './use-policy-url-inputs';

export const useSystematicPrograms = () => {
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const {
    data: systematicPrograms,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QueryKeys.SYSTEMATIC_PREMIUMS, planCode, policyNumber],
    queryFn: () => getAllSystematicPrograms({ planCode, policyNumber }),
    staleTime: FIFTEEN_MINUTES_IN_MS,
    enabled: !!planCode?.length && !!policyNumber?.length,
  });
  return {
    systematicPrograms,
    isLoading,
    error,
  };
};

export const useSystematicProgramsFor = (arrangementId?: string | null) => {
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const { data, isLoading, error } = useQuery({
    queryKey: [
      QueryKeys.SYSTEMATIC_PREMIUMS,
      planCode,
      policyNumber,
      arrangementId,
    ],
    queryFn: () => getAllSystematicPrograms({ planCode, policyNumber }),
    staleTime: FIFTEEN_MINUTES_IN_MS,
    enabled: !!planCode?.length && !!policyNumber?.length && !!arrangementId,
    select: data => data.find(sp => sp.arrangementId === arrangementId),
  });
  return {
    data,
    isLoading,
    error,
  };
};
