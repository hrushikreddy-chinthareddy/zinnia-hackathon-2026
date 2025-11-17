import { PartyRole, ProductType } from '@zinnia/api-types/types/sor';

import { RouteKey } from '@/route-map';
import { UserInfo } from '@/types/logging';
import {
  buildCommonLogContext,
  CommonLogContext,
} from '@/utils/logging/server-logging';
import { isPayorOnly, partyRolesAreInAllowedList } from '@/utils/party';

import { ComponentName } from './types';
import { getLoggedInUserPolicyAndPartyData } from '../policy';
import {
  evaluateComponentVisibilityRules,
  evaluateRouteRules,
  getComponentVisibility,
} from './index';
import { getLoggedInUserPolicyAndPartyDataErrors } from '../policy/types';

// Mock dependencies
jest.mock('../../utils/logging/log-fns');
jest.mock('../../utils/logging/server-logging');
jest.mock('../../utils/party');
jest.mock('../policy');
jest.mock('@optimizely/optimizely-sdk', () => ({
  createInstance: jest.fn(),
  OptimizelyDecideOption: {
    ENABLED_FLAGS_ONLY: 'ENABLED_FLAGS_ONLY',
    IGNORE_USER_PROFILE_SERVICE: 'IGNORE_USER_PROFILE_SERVICE',
  },
}));

describe('display-rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('evaluateComponentVisibilityRules', () => {
    const mockPolicy = {
      product: {
        productType: ProductType.UNIVERSALLIFE,
      },
    };

    const termPolicy = {
      product: {
        productType: ProductType.TERM,
      },
    };

    const mockLog = {
      user: {} as UserInfo,
      correlationId: 'mock-correlation',
    } as CommonLogContext;

    it('should return all components visible for non-payor with non-term policy', () => {
      (isPayorOnly as jest.Mock).mockReturnValue(false);

      const result = evaluateComponentVisibilityRules(
        { policy: mockPolicy, partyRoles: [PartyRole.OWNER] },
        mockLog
      );

      // Check a few key components
      expect(result[ComponentName.OVERVIEW_PROFILE]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_ACCOUNT_VALUE]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_COVERAGE]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_BENEFICIARIES]()).toBe(true);
      expect(result[ComponentName.PROFILE_PAYOR_PARTY_ROLES]()).toBe(false);
    });

    it('should restrict components for payor-only role', () => {
      (isPayorOnly as jest.Mock).mockReturnValue(true);

      const result = evaluateComponentVisibilityRules(
        { policy: mockPolicy, partyRoles: [PartyRole.PAYOR] },
        mockLog
      );

      expect(result[ComponentName.OVERVIEW_PROFILE]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_PAYMENT_HISTORY]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_PREMIUM_DETAILED_VIEW]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_COVERAGE]()).toBe(false);
      expect(result[ComponentName.OVERVIEW_BENEFICIARIES]()).toBe(false);
      expect(result[ComponentName.PROFILE_PAYOR_PARTY_ROLES]()).toBe(true);
    });

    it('should hide account value for term policies', () => {
      (isPayorOnly as jest.Mock).mockReturnValue(false);

      const result = evaluateComponentVisibilityRules(
        {
          policy: termPolicy,
          partyRoles: [PartyRole.OWNER],
        },
        mockLog
      );

      expect(result[ComponentName.OVERVIEW_ACCOUNT_VALUE]()).toBe(false);
      expect(result[ComponentName.OTTP_PAYMENT_SUMMARY_ACCOUNT_VALUE]()).toBe(
        false
      );
    });

    it('should override restrictions when skip is true', () => {
      (isPayorOnly as jest.Mock).mockReturnValue(true);

      const result = evaluateComponentVisibilityRules(
        {
          policy: termPolicy,
          partyRoles: [PartyRole.PAYOR],
          skip: true,
        },
        mockLog
      );

      expect(result[ComponentName.OVERVIEW_COVERAGE]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_BENEFICIARIES]()).toBe(true);
      expect(result[ComponentName.OVERVIEW_ACCOUNT_VALUE]()).toBe(true);
    });
  });

  describe('evaluateRouteRules', () => {
    const mockPolicy = {
      product: {
        productType: ProductType.UNIVERSALLIFE,
      },
    };

    const termPolicy = {
      product: {
        productType: ProductType.TERM,
      },
    };

    it('should allow all routes for non-payor with non-term policy', () => {
      (isPayorOnly as jest.Mock).mockReturnValue(false);
      (partyRolesAreInAllowedList as jest.Mock).mockReturnValue(true);

      const result = evaluateRouteRules(mockPolicy, [PartyRole.OWNER]);

      expect(result![RouteKey.ACCOUNT]()).toBe(true);
      expect(result![RouteKey.BENEFICIARIES]()).toBe(true);
      expect(result![RouteKey.COVERAGE]()).toBe(true);
      expect(result![RouteKey.DOCUMENTS]()).toBe(true);
    });

    it('should restrict routes for payor-only role', () => {
      (isPayorOnly as jest.Mock).mockReturnValue(true);
      (partyRolesAreInAllowedList as jest.Mock).mockReturnValue(true);

      const result = evaluateRouteRules(mockPolicy, [PartyRole.PAYOR]);

      expect(result![RouteKey.ACCOUNT]()).toBe(false);
      expect(result![RouteKey.BENEFICIARIES]()).toBe(false);
      expect(result![RouteKey.COVERAGE]()).toBe(true);
      expect(result![RouteKey.PREMIUM]()).toBe(true);
    });

    it('should hide account route for term policies', () => {
      (isPayorOnly as jest.Mock).mockReturnValue(false);

      const result = evaluateRouteRules(termPolicy, [PartyRole.OWNER]);

      expect(result![RouteKey.ACCOUNT]()).toBe(false);
      expect(result![RouteKey.COVERAGE]()).toBe(true);
    });
  });

  describe('getComponentVisibility', () => {
    const mockPolicyNumber = '12345';
    const mockPlanCode = 'ABC123';
    const mockPolicyInputs = {
      planCode: mockPlanCode,
      policyNumber: mockPolicyNumber,
    };
    // const mockLoggingContext = { requestId: 'test-id' };
    const mockPolicy = { product: { productType: ProductType.UNIVERSALLIFE } };
    const mockPartyRoles = [PartyRole.OWNER];
    const mockLoggingContext = {
      user: { sessionId: '', partyId: '', userId: '', email: '' } as UserInfo,
      correlationId: 'mock-correlation',
      requestId: 'mock-requestId',
    };

    beforeEach(() => {
      (buildCommonLogContext as jest.Mock).mockResolvedValue(
        mockLoggingContext
      );
    });

    it('should return component visibility rules when successful', async () => {
      (getLoggedInUserPolicyAndPartyData as jest.Mock).mockResolvedValue({
        data: {
          policy: mockPolicy,
          partyRoles: mockPartyRoles,
        },
      });

      const { data: result } = await getComponentVisibility(
        mockPolicyInputs,
        mockLoggingContext
      );

      expect(result).toBeTruthy();
      expect(typeof result![ComponentName.OVERVIEW_PROFILE]).toBe('function');
    });

    it('should handle NO_PARTY_ID_FOUND error by setting skip to true', async () => {
      (getLoggedInUserPolicyAndPartyData as jest.Mock).mockResolvedValue({
        data: {
          policy: mockPolicy,
          partyRoles: mockPartyRoles,
        },
        error: {
          cause: getLoggedInUserPolicyAndPartyDataErrors.NO_PARTY_ID_FOUND,
        },
      });

      const { data: result } = await getComponentVisibility(
        mockPolicyInputs,
        mockLoggingContext
      );

      expect(result).toBeTruthy();
      // Even with isPayorOnly true, components should be visible due to skip
      (isPayorOnly as jest.Mock).mockReturnValue(true);
      expect(result![ComponentName.OVERVIEW_COVERAGE]()).toBe(true);
      expect(result![ComponentName.OVERVIEW_BENEFICIARIES]()).toBe(true);
      expect(result![ComponentName.OVERVIEW_ACCOUNT_VALUE]()).toBe(true);
    });
  });
});
