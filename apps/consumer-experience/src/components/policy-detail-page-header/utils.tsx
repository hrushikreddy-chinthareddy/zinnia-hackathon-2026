import { toTitleCase } from '@zinnia/utils';

import { getPageTitle, RouteKey } from '@/route-map';
import { LineOfBusinessPath } from '@/types';

export interface Breadcrumb {
  url: string;
  title: string;
}

export const lineOfBusinessPath = (pathname: string) => {
  const pathParts = pathname.split('/');
  return pathParts[2] as LineOfBusinessPath;
};

export const lastPathPart = (pathname: string) => {
  const pathParts = pathname.split('/');
  return pathParts[pathParts.length - 1];
};

export const getPageTitleByPathPart = ({
  lineOfBusiness,
  pathPart,
  policyNumber,
  beneficiaryKey,
}: {
  lineOfBusiness: LineOfBusinessPath;
  pathPart: string;
  policyNumber: string;
  beneficiaryKey: string;
}) => {
  if (!pathPart) {
    return '';
  }

  const overviewTitle =
    lineOfBusiness === LineOfBusinessPath.ANNUITIES
      ? 'contract overview'
      : 'policy overview';

  if (pathPart === policyNumber) {
    return toTitleCase(overviewTitle);
    // if the beneficiary id is the route key it means we are on a Beneficiary Detail page
  } else {
    return getPageTitle(`/${pathPart}` as RouteKey, lineOfBusiness);
  }
};
