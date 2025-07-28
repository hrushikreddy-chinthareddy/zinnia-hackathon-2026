import { PartyReferenceDataModel } from '@zinnia/api-types/types/partyreference';
import { PartyRole } from '@zinnia/api-types/types/sor';

import {
  getPolicyPartyIdByPolicyNumber,
  getPartyRolesByPolicyNumber,
} from './transformers';

describe('getPartyIdByPolicyNumber', () => {
  const mockPartyReferenceData: PartyReferenceDataModel = {
    alias: [
      { policyNumber: 'POL123', partyId: 'PARTY001' },
      { policyNumber: 'POL456', partyId: 'PARTY002' },
      { policyNumber: 'POL789', partyId: 'PARTY003' },
    ],
  };

  test('should return the correct partyId when policy number exists', () => {
    expect(
      getPolicyPartyIdByPolicyNumber(mockPartyReferenceData, 'POL123')
    ).toBe('PARTY001');
    expect(
      getPolicyPartyIdByPolicyNumber(mockPartyReferenceData, 'POL456')
    ).toBe('PARTY002');
    expect(
      getPolicyPartyIdByPolicyNumber(mockPartyReferenceData, 'POL789')
    ).toBe('PARTY003');
  });

  test('should return empty string when policy number does not exist', () => {
    expect(
      getPolicyPartyIdByPolicyNumber(mockPartyReferenceData, 'NONEXISTENT')
    ).toBe(undefined);
  });

  test('should handle empty alias array', () => {
    const emptyData: PartyReferenceDataModel = {
      alias: [],
    };
    expect(getPolicyPartyIdByPolicyNumber(emptyData, 'POL123')).toBe(undefined);
  });

  test('should handle undefined policy number', () => {
    expect(
      getPolicyPartyIdByPolicyNumber(
        mockPartyReferenceData,
        undefined as unknown as string
      )
    ).toBe(undefined);
  });
});

describe('getPartyRolesByPolicyNumber', () => {
  const mockPartyReferenceData: PartyReferenceDataModel = {
    alias: [
      {
        policyNumber: 'POL123',
        partyId: 'PARTY001',
        partyRoles: [PartyRole.OWNER, PartyRole.INSURED],
      },
      {
        policyNumber: 'POL456',
        partyId: 'PARTY002',
        partyRoles: [PartyRole.PAYEE],
      },
      {
        policyNumber: 'POL789',
        partyId: 'PARTY003',
        partyRoles: [PartyRole.PRIMARYBENEFICIARY, PartyRole.PAYOR],
      },
    ],
  };

  test('should return the correct party roles when policy number exists', () => {
    expect(
      getPartyRolesByPolicyNumber(mockPartyReferenceData, 'POL123')
    ).toEqual([PartyRole.OWNER, PartyRole.INSURED]);
    expect(
      getPartyRolesByPolicyNumber(mockPartyReferenceData, 'POL456')
    ).toEqual([PartyRole.PAYEE]);
    expect(
      getPartyRolesByPolicyNumber(mockPartyReferenceData, 'POL789')
    ).toEqual([PartyRole.PRIMARYBENEFICIARY, PartyRole.PAYOR]);
  });

  test('should return undefined when policy number does not exist', () => {
    expect(
      getPartyRolesByPolicyNumber(mockPartyReferenceData, 'NONEXISTENT')
    ).toBeUndefined();
  });

  test('should handle empty alias array', () => {
    const emptyData: PartyReferenceDataModel = {
      alias: [],
    };
    expect(getPartyRolesByPolicyNumber(emptyData, 'POL123')).toBeUndefined();
  });

  test('should handle undefined policy number', () => {
    expect(
      getPartyRolesByPolicyNumber(
        mockPartyReferenceData,
        undefined as unknown as string
      )
    ).toBeUndefined();
  });

  test('should handle policy with no party roles', () => {
    const dataWithoutPartyRoles: PartyReferenceDataModel = {
      alias: [{ policyNumber: 'POL123', partyId: 'PARTY001' }],
    };
    expect(
      getPartyRolesByPolicyNumber(dataWithoutPartyRoles, 'POL123')
    ).toBeUndefined();
  });

  test('should handle policy with empty party roles array', () => {
    const dataWithEmptyPartyRoles: PartyReferenceDataModel = {
      alias: [{ policyNumber: 'POL123', partyId: 'PARTY001', partyRoles: [] }],
    };
    expect(
      getPartyRolesByPolicyNumber(dataWithEmptyPartyRoles, 'POL123')
    ).toEqual([]);
  });
});
