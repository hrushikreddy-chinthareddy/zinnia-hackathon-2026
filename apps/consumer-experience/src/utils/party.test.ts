import { PartyRole } from '@zinnia/api-types/types/sor';

import { isPartyOwner, isPartyPayor, isPayorOnly } from './party';

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
});
