import { PolicyParty } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import { PartyRole } from '@zinnia/api-types/types/sor';

import {
  isPartyOwner,
  isPartyPayor,
  isPayorOnly,
  partyRolesAreInAllowedList,
  filterPayorViewParties,
  filterOutCoverageInsuredParties,
} from './party';

jest.mock('@/utils/logging/log-fns');

describe('Party Role Utility Functions', () => {
  describe('isPartyOwner', () => {
    test('should return true when PartyRole.OWNER is in the array', () => {
      expect(isPartyOwner([PartyRole.OWNER])).toBe(true);
      expect(isPartyOwner([PartyRole.PAYOR, PartyRole.OWNER])).toBe(true);
      expect(isPartyOwner([PartyRole.OWNER, PartyRole.INSURED])).toBe(true);
    });

    test('should return false when PartyRole.OWNER is not in the array', () => {
      expect(isPartyOwner([])).toBe(false);
      expect(isPartyOwner([PartyRole.PAYOR])).toBe(false);
      expect(isPartyOwner([PartyRole.INSURED, PartyRole.PAYOR])).toBe(false);
    });
  });

  describe('isPartyPayor', () => {
    test('should return true when PartyRole.PAYOR is in the array', () => {
      expect(isPartyPayor([PartyRole.PAYOR])).toBe(true);
      expect(isPartyPayor([PartyRole.PAYOR, PartyRole.OWNER])).toBe(true);
      expect(isPartyPayor([PartyRole.INSURED, PartyRole.PAYOR])).toBe(true);
    });

    test('should return false when PartyRole.PAYOR is not in the array', () => {
      expect(isPartyPayor([])).toBe(false);
      expect(isPartyPayor([PartyRole.OWNER])).toBe(false);
      expect(isPartyPayor([PartyRole.INSURED, PartyRole.OWNER])).toBe(false);
    });
  });

  describe('isPayorOnly', () => {
    test('should return true when PartyRole.PAYOR is in the array but PartyRole.OWNER is not', () => {
      expect(isPayorOnly([PartyRole.PAYOR])).toBe(true);
      expect(isPayorOnly([PartyRole.PAYOR, PartyRole.INSURED])).toBe(true);
    });

    test('should return false when PartyRole.PAYOR is not in the array', () => {
      expect(isPayorOnly([])).toBe(false);
      expect(isPayorOnly([PartyRole.INSURED])).toBe(false);
      expect(isPayorOnly([PartyRole.OWNER])).toBe(false);
    });

    test('should return false when both PartyRole.PAYOR and PartyRole.OWNER are in the array', () => {
      expect(isPayorOnly([PartyRole.PAYOR, PartyRole.OWNER])).toBe(false);
      expect(
        isPayorOnly([PartyRole.INSURED, PartyRole.PAYOR, PartyRole.OWNER])
      ).toBe(false);
    });
  });

  describe('partyRolesAreInAllowedList', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true when roles are in the accepted list', () => {
      const mockPartyRoles = [PartyRole.OWNER, PartyRole.INSURED];

      const result = partyRolesAreInAllowedList(mockPartyRoles);

      expect(result).toBe(true);
    });

    it('should return false when no roles are in the accepted list', () => {
      const mockPartyRoles = [PartyRole.AGENT];

      const result = partyRolesAreInAllowedList(mockPartyRoles);

      expect(result).toBe(false);
      expect(logTrace).toHaveBeenCalledWith(
        'Party roles were not found in allowed list',
        {
          filteredPartyRoles: [],
          partyRoles: mockPartyRoles,
          acceptedRoles: expect.any(Array),
        }
      );
    });

    it('should return true when at least one role is in the accepted list', () => {
      const mockPartyRoles = [PartyRole.OWNER, PartyRole.AGENT];

      const result = partyRolesAreInAllowedList(mockPartyRoles);

      expect(result).toBe(true);
    });

    it('should handle an empty roles array', () => {
      const mockPartyRoles = <PartyRole[]>[];

      const result = partyRolesAreInAllowedList(mockPartyRoles);

      expect(result).toBe(false);
      expect(logTrace).toHaveBeenCalledWith(
        'Party roles were not found in allowed list',
        {
          filteredPartyRoles: [],
          partyRoles: mockPartyRoles,
          acceptedRoles: expect.any(Array),
        }
      );
    });
  });

  describe('filterPayorViewParties', () => {
    test('should return parties with PAYOR role', () => {
      const parties: PolicyParty[] = [
        { partyId: '1', partyRoles: [PartyRole.PAYOR] },
        { partyId: '2', partyRoles: [PartyRole.INSURED] },
      ];
      const result = filterPayorViewParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyId).toBe('1');
    });

    test('should return parties with OWNER role', () => {
      const parties: PolicyParty[] = [
        { partyId: '1', partyRoles: [PartyRole.OWNER] },
        { partyId: '2', partyRoles: [PartyRole.INSURED] },
      ];
      const result = filterPayorViewParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyId).toBe('1');
    });

    test('should return parties with JOINTOWNER role', () => {
      const parties: PolicyParty[] = [
        { partyId: '1', partyRoles: [PartyRole.JOINTOWNER] },
        { partyId: '2', partyRoles: [PartyRole.INSURED] },
      ];
      const result = filterPayorViewParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyId).toBe('1');
    });

    test('should return parties with multiple relevant roles', () => {
      const parties: PolicyParty[] = [
        { partyId: '1', partyRoles: [PartyRole.PAYOR, PartyRole.OWNER] },
      ];
      const result = filterPayorViewParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyId).toBe('1');
    });

    test('should exclude parties without relevant roles', () => {
      const parties: PolicyParty[] = [
        { partyId: '1', partyRoles: [PartyRole.INSURED] },
        { partyId: '2', partyRoles: [PartyRole.AGENT] },
      ];
      const result = filterPayorViewParties(parties);
      expect(result).toHaveLength(0);
    });

    test('should handle parties with undefined partyRoles', () => {
      const parties: PolicyParty[] = [{ partyId: '1', partyRoles: undefined }];
      const result = filterPayorViewParties(parties);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterOutCoverageInsuredParties', () => {
    test('should exclude parties with only COVERAGEINSURED role', () => {
      const parties: PolicyParty[] = [
        { partyId: '1', partyRoles: [PartyRole.COVERAGEINSURED] },
        { partyId: '2', partyRoles: [PartyRole.OWNER] },
      ];
      const result = filterOutCoverageInsuredParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyId).toBe('2');
    });

    test('should keep parties with COVERAGEINSURED plus other roles, removing only COVERAGEINSURED', () => {
      const parties: PolicyParty[] = [
        {
          partyId: '1',
          partyRoles: [PartyRole.COVERAGEINSURED, PartyRole.OWNER],
        },
      ];
      const result = filterOutCoverageInsuredParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyRoles).toEqual([PartyRole.OWNER]);
    });

    test('should keep parties without COVERAGEINSURED role unchanged', () => {
      const parties: PolicyParty[] = [
        { partyId: '1', partyRoles: [PartyRole.OWNER, PartyRole.PAYOR] },
      ];
      const result = filterOutCoverageInsuredParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyRoles).toEqual([PartyRole.OWNER, PartyRole.PAYOR]);
    });

    test('should handle parties with undefined partyRoles', () => {
      const parties: PolicyParty[] = [{ partyId: '1', partyRoles: undefined }];
      const result = filterOutCoverageInsuredParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyRoles).toBeUndefined();
    });

    test('should handle multiple COVERAGEINSURED roles correctly', () => {
      const parties: PolicyParty[] = [
        {
          partyId: '1',
          partyRoles: [
            PartyRole.COVERAGEINSURED,
            PartyRole.COVERAGEINSURED,
            PartyRole.OWNER,
          ],
        },
      ];
      const result = filterOutCoverageInsuredParties(parties);
      expect(result[0]!.partyRoles).toEqual([PartyRole.OWNER]);
    });

    test('should handle empty partyRoles array', () => {
      const parties: PolicyParty[] = [{ partyId: '1', partyRoles: [] }];
      const result = filterOutCoverageInsuredParties(parties);
      expect(result).toHaveLength(1);
      expect(result[0]!.partyRoles).toEqual([]);
    });
  });
});
