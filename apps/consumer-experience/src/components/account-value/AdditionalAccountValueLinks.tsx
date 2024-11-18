import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { FC } from 'react';

import { lineOfBusinessUrlPath } from '@/utils/data';

import { GenerateClickableContainerList } from '../clickable-card-container/GenerateClickableContainerList';

interface AdditionalAccountValueLinksProps {
  lineOfBusiness: LineOfBusiness;
  planCode: string;
  policyNumber: string;
}

export const AdditionalAccountValueLinks: FC<
  AdditionalAccountValueLinksProps
> = ({ lineOfBusiness, planCode, policyNumber }) => {
  const lineOfBusinessURL = lineOfBusinessUrlPath(lineOfBusiness);

  const links = [
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/account/allocations`,
      urlLabel: 'allocations',
      isInternal: true,
      linkText: 'Allocations',
    },
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/account/withdrawals`,
      urlLabel: 'withdrawals',
      isInternal: true,
      linkText: 'Withdrawals',
    },
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/account/loans`,
      urlLabel: 'loans',
      isInternal: true,
      linkText: 'Loans',
    },
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/account/surrender`,
      urlLabel: 'go to surrender policy page',
      isInternal: true,
      linkText: 'Surrender Policy',
    },
  ];

  return <GenerateClickableContainerList links={links} />;
};
