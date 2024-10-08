import { CarrierNames, Subdomains } from '@/types/carriers';
import { CarrierId, CarrierPolicyDetails } from '@/types/policy';

import { filterPoliciesByCarrierId } from './policy';
import { prependSubdomain } from './url';

export const getCarrierSubdomainById = (
  carrierId: string | undefined | null
): string => {
  switch (carrierId?.toUpperCase()) {
    case CarrierId.ELIC:
    case CarrierId.SBUL:
      return Subdomains.EVERLY;
    // TODO: Add this to the carrierId enum when it gets added in the backend
    case 'WELB':
      return Subdomains.WELLABE;

    default:
      return '';
  }
};

export const getCarrierSubdomainByName = (
  name: string | undefined | null
): string => {
  switch (name) {
    case CarrierNames.EVERLY:
      return Subdomains.EVERLY;
    case CarrierNames.WELLABE:
      return Subdomains.WELLABE;

    default:
      return '';
  }
};

export const getCarrierNameById = (
  carrierId: string | undefined | null
): string => {
  switch (carrierId?.toUpperCase()) {
    case CarrierId.ELIC:
    case CarrierId.SBUL:
      return CarrierNames.EVERLY;
    // TODO: Change this to the enum value when it gets added to the backend
    case 'WELB':
      return CarrierNames.WELLABE;
    default:
      return '';
  }
};

export const getCarrierNamesFromIds = (ids: Set<string>) => {
  const carrierNames = new Set<string>();
  for (const id of ids) {
    const name = getCarrierNameById(id);
    if (name) {
      carrierNames.add(name);
    }
  }
  return carrierNames;
};

export const getCarrierIdsFromPolicies = (
  policies: CarrierPolicyDetails[] | null
) => {
  const carrierIds = new Set<string>();
  if (!policies) return carrierIds;
  for (const policy of policies) {
    if (policy.carrierId) {
      carrierIds.add(policy.carrierId);
    }
  }
  return carrierIds;
};

export const getCarrierIdsByName = (name: string | undefined) => {
  switch (name) {
    case 'Everly':
      return [CarrierId.ELIC, CarrierId.SBUL];
    case 'Wellabe':
      return ['WELB'];
    default:
      return [];
  }
};

export const getCarrierIdsByThemeCookie = (themeCookie: string | undefined) => {
  switch (themeCookie) {
    case 'everly':
      return [CarrierId.ELIC, CarrierId.SBUL];
    case 'wellabe':
      return ['WELB'];
    default:
      return [CarrierId.ELIC, CarrierId.SBUL, 'WELB'];
  }
};

export const hasMultipleCarriers = (
  policies: CarrierPolicyDetails[] | null
) => {
  const carrierIds = getCarrierIdsFromPolicies(policies);
  const carrierNames = getCarrierNamesFromIds(carrierIds);
  return carrierNames.size > 1;
};
export const isSingleCarrier = (policies: CarrierPolicyDetails[] | null) => {
  const carrierIds = getCarrierIdsFromPolicies(policies);
  const carrierNames = getCarrierNamesFromIds(carrierIds);
  return carrierNames.size === 1;
};

export const isValidCarrierSubdomain = (
  value: string | undefined
): value is Subdomains => {
  return Object.values(Subdomains).some(enumValue => enumValue === value);
};

export interface CarrierListDetail {
  link: {
    href: string;
    label: string;
  };
  displayText: string;
  carrierName: CarrierNames;
}

export const getCarrierListDetails = (
  policies: CarrierPolicyDetails[]
): CarrierListDetail[] => {
  const carrierIds = getCarrierIdsFromPolicies(policies);

  return Array.from(carrierIds).map(id => {
    const name = getCarrierNameById(id);
    const subdomain = getCarrierSubdomainByName(name);
    const subdomainPath = prependSubdomain(subdomain);
    const carrierIds = getCarrierIdsByName(name);
    const policiesNumber = filterPoliciesByCarrierId(
      policies,
      carrierIds
    ).length;
    const displayText =
      policiesNumber > 1
        ? `(${policiesNumber} policies)`
        : `(${policiesNumber} policy)`;

    return {
      link: {
        label: name,
        href: subdomainPath,
      },
      displayText,
      carrierName: name,
    } as CarrierListDetail;
  });
};
