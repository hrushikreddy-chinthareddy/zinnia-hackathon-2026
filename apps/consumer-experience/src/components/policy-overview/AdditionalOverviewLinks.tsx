import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { getCoverage } from '@/services';
import { lineOfBusinessUrlPath } from '@/utils/data';

import { GenerateClickableContainerList } from '../clickable-card-container/GenerateClickableContainerList';

interface AdditionalLinksProps {
  lineOfBusiness: LineOfBusiness;
  planCode: string;
  policyNumber: string;
}

const AdditionalLinks: FC<AdditionalLinksProps> = async ({
  lineOfBusiness,
  planCode,
  policyNumber,
}) => {
  const lineOfBusinessURL = lineOfBusinessUrlPath(lineOfBusiness);
  const { data, error } = await getCoverage({
    planCode,
    policyNumber,
  });

  if (error) {
    return null;
  }

  const { beneficiaryCount } = data!;

  const links = [
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/profile`,
      urlLabel: 'owner profile',
      isInternal: true,
      iconType: IconType.CIRCLE_USER,
      linkText: 'Owner Profile',
    },
    ...(beneficiaryCount && beneficiaryCount > 0
      ? [
          {
            url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/beneficiaries`,
            urlLabel: 'beneficiaries',
            isInternal: true,
            iconType: IconType.USER_GROUP,
            linkText: 'Beneficiaries',
          },
        ]
      : []),
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/riders`,
      urlLabel:
        lineOfBusiness === LineOfBusiness.ANNUITY
          ? 'riders and extras'
          : 'riders and feature',
      isInternal: true,
      iconType: IconType.SUPPORT,
      linkText:
        lineOfBusiness === LineOfBusiness.ANNUITY
          ? 'Riders and extras'
          : 'riders and features',
    },
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/documents`,
      urlLabel: 'documents',
      isInternal: true,
      iconType: IconType.DOCUMENT_TEXT,
      linkText: 'Documents',
    },
  ];

  return <GenerateClickableContainerList links={links} />;
};

export default AdditionalLinks;
