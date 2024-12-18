'use client';

import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { lineOfBusinessUrlPath } from '@/utils/data';

export const PolicyNumber = ({
  policyNumber,
  planCode,
  lineOfBusiness,
}: {
  policyNumber: string;
  planCode: string;
  lineOfBusiness?: LineOfBusiness;
}) => {
  const pathname = usePathname();
  const policyUrl = `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}`;

  if (pathname === policyUrl) {
    return <span>{policyNumber}</span>;
  }

  return <Link href={policyUrl}>{policyNumber}</Link>;
};
