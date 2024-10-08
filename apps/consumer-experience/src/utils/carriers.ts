import { CarrierNames, Subdomains } from '@/types/carriers';
import { CarrierId, CarrierPolicyDetails } from '@/types/policy';

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

/**
 * Returns a Set of carrier names for the given set of carrier IDs.
 * If an ID doesn't correspond to a known carrier, it is ignored.
 * @param ids The Set of carrier IDs to get the names for.
 * @returns A Set of the carrier names.
 */
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

/**
 * Returns a Set of unique carrier IDs from the given policies.
 * If the policies array is empty or null, an empty Set is returned.
 * @param policies The policies to get the carrier IDs from.
 * @returns A Set of unique carrier IDs.
 */
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

type PoliciesGroupedByCarrier = { [key: string]: CarrierPolicyDetails[] };

export const getCarrierListDetails = (
  policies: CarrierPolicyDetails[]
): CarrierListDetail[] => {
  const policiesGroupedByCarrier = policies.reduce((acc, policy) => {
    const policyCarrierName = getCarrierNameById(policy.carrierId);
    if (policyCarrierName) {
      acc[policyCarrierName] = [...(acc[policyCarrierName] || []), policy];
    }

    return acc;
  }, {} as PoliciesGroupedByCarrier);

  return Object.keys(policiesGroupedByCarrier).map(carrier => {
    const name = carrier;
    const subdomain = getCarrierSubdomainByName(name);
    const subdomainPath = prependSubdomain(subdomain);
    const policiesNumber = policiesGroupedByCarrier[name]?.length;
    let displayText = '';

    if (policiesNumber) {
      displayText =
        policiesNumber > 1
          ? `(${policiesNumber} policies)`
          : `(${policiesNumber} policy)`;
    }

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
