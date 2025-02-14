import { toTitleCase } from '@zinnia/utils';

import { getPageTitle, RouteKey } from '@/route-map';
import { LineOfBusinessPath } from '@/types';

export interface Breadcrumb {
  url: string;
  title: string;
}

// TODO: write tests for this
export const generateBreadcrumbs = ({
  pathParts,
  policyNumber,
  beneficiaryKey,
  rootPageTitle,
}: {
  pathParts: string[];
  policyNumber: string;
  beneficiaryKey: string;
  rootPageTitle: string;
}) => {
  const breadcrumbsList = [];
  const pathPartsCount = pathParts.length;
  for (let i = pathPartsCount - 1; i >= 0; i--) {
    const currentPathPart = pathParts[i];
    const breadcrumbUrl = pathParts.slice(0, i + 1).join('/');
    // if the current path part is the policy number it means we have reached the policy overview
    // and we can return after adding this breadcrumb
    if (currentPathPart === policyNumber) {
      breadcrumbsList.unshift({
        title: toTitleCase(rootPageTitle),
        url: breadcrumbUrl,
      });
      break;
      // if the beneficiary id is the route key it means we are on a Beneficiary Detail page
    } else if (currentPathPart === beneficiaryKey) {
      breadcrumbsList.unshift({
        title: getPageTitle(RouteKey.BENEFICIARY),
        url: breadcrumbUrl,
      });
    } else {
      const title = getPageTitle(
        `/${currentPathPart}` as RouteKey,
        pathParts[2] as LineOfBusinessPath
      );
      breadcrumbsList.unshift({ title, url: breadcrumbUrl });
    }
  }

  return breadcrumbsList;
};
