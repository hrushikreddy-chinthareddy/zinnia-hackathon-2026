'use client';

import { useParams, usePathname } from 'next/navigation';

import {
  lineOfBusinessFromPathname,
  lineOfBusinessUrlPath,
} from '@/utils/data';

export const usePolicyUrlInputs = () => {
  const pathname = usePathname();
  const params = useParams<{
    planCode: string;
    policyNumber: string;
  }>();

  const lineOfBusiness = lineOfBusinessFromPathname(pathname);
  const lineOfBusinessUrl = lineOfBusinessUrlPath(lineOfBusiness);

  return {
    policyNumber: params.policyNumber,
    planCode: params.planCode,
    lineOfBusinessUrl,
  };
};
