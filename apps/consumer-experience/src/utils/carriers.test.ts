import { PolicyStatus } from '@zinnia/api-types/types/sor';

import { CarrierId, CarrierPolicyDetails } from '@/types/policy';

import {
  getCarrierSubdomainById,
  getCarrierSubdomainByName,
  getCarrierNameById,
  Subdomains,
  CarrierNames,
  getCarrierIdsFromPolicies,
  getCarrierNamesFromIds,
  hasMultipleCarriers,
} from './carriers';

describe('carriers', () => {
  describe('getCarrierSubdomainById', () => {
    it('should return the correct subdomain for EVERLY', () => {
      expect(getCarrierSubdomainById(CarrierId.ELIC)).toBe(Subdomains.EVERLY);
    });

    it('should return the correct subdomain for WELLABE', () => {
      //TODO: Change this to the enum value when it gets added to the backend
      expect(getCarrierSubdomainById('WELB')).toBe(Subdomains.WELLABE);
    });

    it('should return an empty string for an unknown carrier ID', () => {
      expect(getCarrierSubdomainById('unknown')).toBe('');
    });

    it('should return an empty string for a null or undefined carrier ID', () => {
      expect(getCarrierSubdomainById(null)).toBe('');
      expect(getCarrierSubdomainById(undefined)).toBe('');
    });
  });

  describe('getCarrierSubdomainByName', () => {
    it('should return the correct subdomain for EVERLY', () => {
      expect(getCarrierSubdomainByName(CarrierNames.EVERLY)).toBe(
        Subdomains.EVERLY
      );
    });

    it('should return the correct subdomain for WELLABE', () => {
      expect(getCarrierSubdomainByName(CarrierNames.WELLABE)).toBe(
        Subdomains.WELLABE
      );
    });

    it('should return an empty string for an unknown carrier name', () => {
      expect(getCarrierSubdomainByName('unknown')).toBe('');
    });

    it('should return an empty string for a null or undefined carrier name', () => {
      expect(getCarrierSubdomainByName(null)).toBe('');
      expect(getCarrierSubdomainByName(undefined)).toBe('');
    });
  });

  describe('getCarrierNameById', () => {
    it('should return the correct carrier name for EVERLY', () => {
      expect(getCarrierNameById(CarrierId.ELIC)).toBe(CarrierNames.EVERLY);
    });

    it('should return the correct carrier name for WELLABE', () => {
      //TODO: Change this to the enum value when it gets added to the backend
      expect(getCarrierNameById('WELB')).toBe(CarrierNames.WELLABE);
    });

    it('should return an empty string for an unknown carrier ID', () => {
      expect(getCarrierNameById('unknown')).toBe('');
    });

    it('should return an empty string for a null or undefined carrier ID', () => {
      expect(getCarrierNameById(null)).toBe('');
      expect(getCarrierNameById(undefined)).toBe('');
    });
  });

  describe('getCarrierIdsFromPolicies', () => {
    it('should return a set of unique carrier IDs from the policies', () => {
      const policies = [
        {
          carrierId: 'ELIC',
          planCode: 'blah',
          marketingName: 'Everly Life',
          planName: 'Everly Life',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          carrierId: 'SBUL',
          planCode: 'blah',
          marketingName: 'SBUL Life',
          planName: 'Everly Life',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          carrierId: 'WELB',
          planCode: 'blah',
          marketingName: 'Welb Annuity',
          planName: 'Welb Annuity',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          carrierId: 'ELIC',
          planCode: 'blah',
          marketingName: 'Everly Life',
          planName: 'Everly Life',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
      ];

      const expectedCarrierIds = new Set(['ELIC', 'SBUL', 'WELB']);
      const actualCarrierIds = getCarrierIdsFromPolicies(policies);

      expect(actualCarrierIds).toEqual(expectedCarrierIds);
    });

    it('should return an empty set if the policies array is empty', () => {
      const policies = [] as CarrierPolicyDetails[];
      const expectedCarrierIds = new Set();
      const actualCarrierIds = getCarrierIdsFromPolicies(policies);

      expect(actualCarrierIds).toEqual(expectedCarrierIds);
    });
  });
  describe('getCarrierNamesFromIds', () => {
    it('should return a set of carrier names for the given IDs', () => {
      //TODO: Change this to the enum value when it gets added to the backend
      const ids = new Set([CarrierId.ELIC, 'WELB']);
      const expectedCarrierNames = new Set([
        CarrierNames.EVERLY,
        CarrierNames.WELLABE,
      ]);
      const actualCarrierNames = getCarrierNamesFromIds(ids);

      expect(actualCarrierNames).toEqual(expectedCarrierNames);
    });

    it('should ignore IDs that do not correspond to a carrier name', () => {
      const ids = new Set([CarrierId.ELIC, 'unknown']);
      const expectedCarrierNames = new Set([CarrierNames.EVERLY]);
      const actualCarrierNames = getCarrierNamesFromIds(ids);

      expect(actualCarrierNames).toEqual(expectedCarrierNames);
    });

    it('should return an empty set if the input set is empty', () => {
      const ids = new Set('');
      const expectedCarrierNames = new Set();
      const actualCarrierNames = getCarrierNamesFromIds(ids);

      expect(actualCarrierNames).toEqual(expectedCarrierNames);
    });

    it('should return an empty set if none of the IDs correspond to a carrier name', () => {
      const ids = new Set(['unknown1', 'unknown2']);
      const expectedCarrierNames = new Set();
      const actualCarrierNames = getCarrierNamesFromIds(ids);

      expect(actualCarrierNames).toEqual(expectedCarrierNames);
    });
  });

  describe('hasMultipleCarriers', () => {
    it('should return true if there are multiple carriers', () => {
      const policies = [
        {
          carrierId: 'ELIC',
          planCode: 'blah',
          marketingName: 'Everly Life',
          planName: 'Everly Life',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          carrierId: 'SBUL',
          planCode: 'blah',
          marketingName: 'SBUL Life',
          planName: 'Everly Life',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          carrierId: 'WELB',
          planCode: 'blah',
          marketingName: 'Welb Annuity',
          planName: 'Welb Annuity',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          carrierId: 'ELIC',
          planCode: 'blah',
          marketingName: 'Everly Life',
          planName: 'Everly Life',
          policyStatus: PolicyStatus.ACTIVE,
          policyNumber: '123',
          firstName: 'John',
          lastName: 'Doe',
        },
      ];

      expect(hasMultipleCarriers(policies)).toBe(true);
    });
  });
});
