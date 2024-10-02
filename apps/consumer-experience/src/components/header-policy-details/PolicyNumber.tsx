'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PolicyNumber = ({
  policyNumber,
  planCode,
}: {
  policyNumber: string;
  planCode: string;
}) => {
  const pathname = usePathname();
  // TODO: annuities update
  const policyUrl = `/coverage/policies/${planCode}/${policyNumber}`;

  if (pathname === policyUrl) {
    return <span>{policyNumber}</span>;
  }

  return <Link href={policyUrl}>{policyNumber}</Link>;
};
