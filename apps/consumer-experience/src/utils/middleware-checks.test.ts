// These tests mostly brought to you by the power of AI
import { NextRequest, NextResponse } from 'next/server';

import { getRouteKeyFromUrl, RouteKey } from '@/route-map';
import { checkResetDeliveryDateEligibility } from '@/services/bpm/delivery-date';
import { getRoutePermissions } from '@/services/display-rules';
import { getPolicyDetails } from '@/services/policy';
import { User } from '@/types/auth';

import { getCarrierSubdomainById, isValidCarrierSubdomain } from './carriers';
import { logTrace } from './logging/log-fns';
import { buildCommonLogContext } from './logging/server-logging';
import {
  getValidSubdomainForPolicy,
  hasPermissionsForPolicyRoute,
  hasAcknowledgedPolicy,
} from './middleware-checks';
import { ACKNOWLEDGEMENT_COOKIE_KEY } from './serverClientUtils';
import { getPolicyDataFromPath } from './url';

// Mock modules that cause async operations after tests
jest.mock('@/services/feature-flags', () => ({
  getFeatureFlag: jest.fn().mockReturnValue(false),
  getFeatureFlagVariant: jest.fn().mockReturnValue(null),
}));

jest.mock('../../constants', () => ({
  COOKIE_DOMAIN: '.mocked-test-domain.com',
}));

jest.mock('./optimizely/optimizely', () => ({
  OptimizelyService: jest.fn().mockImplementation(() => ({
    client: {
      onReady: jest.fn().mockResolvedValue({}),
      close: jest.fn(),
    },
    isFeatureEnabled: jest.fn().mockReturnValue(false),
    getFeatureVariableString: jest.fn().mockReturnValue(''),
  })),
  optimizelyClient: {
    onReady: jest.fn().mockResolvedValue({}),
    close: jest.fn(),
    isFeatureEnabled: jest.fn().mockReturnValue(false),
    getFeatureVariableString: jest.fn().mockReturnValue(''),
  },
}));

// Mock the dependencies
jest.mock('@/services/policy');
jest.mock('@/services/display-rules');
jest.mock('@/services/bpm/delivery-date');
jest.mock('@/route-map');
jest.mock('@/middleware');
jest.mock('./carriers');
jest.mock('./logging/log-fns');
jest.mock('./logging/server-logging');
jest.mock('./url');

describe('getValidSubdomainForPolicy', () => {
  // Setup common mocks
  const mockPolicyDetails = getPolicyDetails as jest.MockedFunction<
    typeof getPolicyDetails
  >;
  const mockGetCarrierSubdomainById =
    getCarrierSubdomainById as jest.MockedFunction<
      typeof getCarrierSubdomainById
    >;
  const mockIsValidCarrierSubdomain =
    isValidCarrierSubdomain as jest.MockedFunction<
      typeof isValidCarrierSubdomain
    >;
  const mockLogTrace = logTrace as jest.MockedFunction<typeof logTrace>;
  const mockBuildCommonLogContext =
    buildCommonLogContext as jest.MockedFunction<typeof buildCommonLogContext>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
    mockBuildCommonLogContext.mockResolvedValue(
      Promise.resolve({
        user: {},
        correlationId: 'test-correlation-id',
      })
    );
  });

  it('should return null when currentSubdomain is not provided', async () => {
    // Arrange
    const params = {
      planCode: 'ABC123',
      policyNumber: 'POL456',
    };

    // Act
    const result = await getValidSubdomainForPolicy(
      params as { planCode: string; policyNumber: string }
    );

    // Assert
    expect(result).toBeNull();
    expect(mockLogTrace).toHaveBeenCalled();
    expect(mockPolicyDetails).not.toHaveBeenCalled();
  });

  it('should return currentSubdomain when it matches the carrier subdomain', async () => {
    // Arrange
    const currentSubdomain = 'carrier1';
    const params = {
      currentSubdomain,
      planCode: 'ABC123',
      policyNumber: 'POL456',
    };

    mockPolicyDetails.mockResolvedValue({
      data: { carrierId: 'carrier1-id' },
      error: null,
    });

    mockGetCarrierSubdomainById.mockReturnValue(currentSubdomain);

    // Act
    const result = await getValidSubdomainForPolicy(params);

    // Assert
    expect(result).toBe(currentSubdomain);
    expect(mockPolicyDetails).toHaveBeenCalledWith(
      { planCode: params.planCode, policyNumber: params.policyNumber },
      expect.anything()
    );
    expect(mockGetCarrierSubdomainById).toHaveBeenCalledWith('carrier1-id');
  });

  it('should return null when no carrier subdomain is found', async () => {
    // Arrange
    const currentSubdomain = 'carrier1';
    const params = {
      currentSubdomain,
      planCode: 'ABC123',
      policyNumber: 'POL456',
    };

    mockPolicyDetails.mockResolvedValue({
      data: { carrierId: 'unknown-carrier-id' },
      error: null,
    });

    mockGetCarrierSubdomainById.mockReturnValue(null as unknown as string);

    // Act
    const result = await getValidSubdomainForPolicy(params);

    // Assert
    expect(result).toBeNull();
    expect(mockLogTrace).toHaveBeenCalled();
  });

  it('should return null when current subdomain is not valid', async () => {
    // Arrange
    const currentSubdomain = 'invalid-carrier';
    const params = {
      currentSubdomain,
      planCode: 'ABC123',
      policyNumber: 'POL456',
    };

    mockPolicyDetails.mockResolvedValue({
      data: { carrierId: 'carrier2-id' },
      error: null,
    });

    mockGetCarrierSubdomainById.mockReturnValue('carrier2');
    mockIsValidCarrierSubdomain.mockReturnValue(false);

    // Act
    const result = await getValidSubdomainForPolicy(params);

    // Assert
    expect(result).toBeNull();
    expect(mockIsValidCarrierSubdomain).toHaveBeenCalledWith(currentSubdomain);
    expect(mockLogTrace).toHaveBeenCalled();
  });

  it('should return carrier subdomain when current subdomain is valid but different', async () => {
    // Arrange
    const currentSubdomain = 'carrier1';
    const carrierSubdomain = 'carrier2';
    const params = {
      currentSubdomain,
      planCode: 'ABC123',
      policyNumber: 'POL456',
    };

    mockPolicyDetails.mockResolvedValue({
      data: { carrierId: 'carrier2-id' },
      error: null,
    });

    mockGetCarrierSubdomainById.mockReturnValue(carrierSubdomain);
    mockIsValidCarrierSubdomain.mockReturnValue(true);

    // Act
    const result = await getValidSubdomainForPolicy(params);

    // Assert
    expect(result).toBe(carrierSubdomain);
    expect(mockIsValidCarrierSubdomain).toHaveBeenCalledWith(currentSubdomain);
  });
});

describe('hasPermissionsForPolicyRoute', () => {
  // Setup common mocks
  const mockGetPolicyDataFromPath =
    getPolicyDataFromPath as jest.MockedFunction<typeof getPolicyDataFromPath>;
  const mockGetRoutePermissions = getRoutePermissions as jest.MockedFunction<
    typeof getRoutePermissions
  >;
  const mockGetRouteKeyFromUrl = getRouteKeyFromUrl as jest.MockedFunction<
    typeof getRouteKeyFromUrl
  >;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  it('should return true when route has permission', async () => {
    // Arrange
    const pathname = '/policy/health/ABC123/POL456/claims';
    const planCode = 'ABC123';
    const policyNumber = 'POL456';
    const routeKey = 'claims' as RouteKey;

    mockGetPolicyDataFromPath.mockReturnValue({
      lineOfBusiness: 'health',
      lineOfBusinessUrl: 'health',
      planCode,
      policyNumber,
    });

    mockGetRouteKeyFromUrl.mockReturnValue(routeKey);

    // Create a mock permissions object with the needed route key
    const mockPermissionsObj = {
      [routeKey]: jest.fn().mockReturnValue(true),
    };

    // Use type assertion to match the expected return type
    mockGetRoutePermissions.mockResolvedValue(
      mockPermissionsObj as unknown as Record<RouteKey, () => boolean>
    );

    // Act
    const result = await hasPermissionsForPolicyRoute(pathname);

    // Assert
    expect(result).toBe(true);
    expect(mockGetPolicyDataFromPath).toHaveBeenCalledWith(pathname);
    expect(mockGetRouteKeyFromUrl).toHaveBeenCalledWith(pathname);
    expect(mockGetRoutePermissions).toHaveBeenCalledWith(
      policyNumber,
      planCode
    );
    expect(mockPermissionsObj[routeKey]).toHaveBeenCalled();
  });

  it('should return false when route does not have permission', async () => {
    // Arrange
    const pathname = '/policy/health/ABC123/POL456/claims';
    const planCode = 'ABC123';
    const policyNumber = 'POL456';
    const routeKey = 'claims' as RouteKey;

    mockGetPolicyDataFromPath.mockReturnValue({
      lineOfBusiness: 'health',
      lineOfBusinessUrl: 'health',
      planCode,
      policyNumber,
    });

    mockGetRouteKeyFromUrl.mockReturnValue(routeKey);

    // Create a mock permissions object with the needed route key
    const mockPermissionsObj = {
      [routeKey]: jest.fn().mockReturnValue(false),
    };

    // Use type assertion to match the expected return type
    mockGetRoutePermissions.mockResolvedValue(
      mockPermissionsObj as unknown as Record<RouteKey, () => boolean>
    );

    // Act
    const result = await hasPermissionsForPolicyRoute(pathname);

    // Assert
    expect(result).toBe(false);
    expect(mockGetPolicyDataFromPath).toHaveBeenCalledWith(pathname);
    expect(mockGetRouteKeyFromUrl).toHaveBeenCalledWith(pathname);
    expect(mockGetRoutePermissions).toHaveBeenCalledWith(
      policyNumber,
      planCode
    );
    expect(mockPermissionsObj[routeKey]).toHaveBeenCalled();
  });

  it('should return false when routePermissions is null', async () => {
    // Arrange
    const pathname = '/policy/health/ABC123/POL456/claims';
    const planCode = 'ABC123';
    const policyNumber = 'POL456';
    const routeKey = 'claims' as RouteKey;

    mockGetPolicyDataFromPath.mockReturnValue({
      lineOfBusiness: 'health',
      lineOfBusinessUrl: 'health',
      planCode,
      policyNumber,
    });

    mockGetRouteKeyFromUrl.mockReturnValue(routeKey);
    mockGetRoutePermissions.mockResolvedValue(null);

    // Act
    const result = await hasPermissionsForPolicyRoute(pathname);

    // Assert
    expect(result).toBe(false);
    expect(mockGetPolicyDataFromPath).toHaveBeenCalledWith(pathname);
    expect(mockGetRouteKeyFromUrl).toHaveBeenCalledWith(pathname);
    expect(mockGetRoutePermissions).toHaveBeenCalledWith(
      policyNumber,
      planCode
    );
  });
});

describe('hasAcknowledgedPolicy', () => {
  // Setup common mocks
  const mockLogTrace = logTrace as jest.MockedFunction<typeof logTrace>;
  const mockCheckResetDeliveryDateEligibility =
    checkResetDeliveryDateEligibility as jest.MockedFunction<
      typeof checkResetDeliveryDateEligibility
    >;

  // Common test data
  const planCode = 'ABC123';
  const policyNumber = 'POL456';
  let mockRequest: jest.Mocked<NextRequest>;
  let mockResponse: jest.Mocked<NextResponse>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Create mock request and response objects
    mockRequest = {
      cookies: {
        get: jest.fn() as jest.MockedFunction<
          typeof NextRequest.prototype.cookies.get
        >,
      },
    } as unknown as jest.Mocked<NextRequest>;

    mockResponse = {
      cookies: {
        set: jest.fn() as jest.MockedFunction<
          typeof NextResponse.prototype.cookies.set
        >,
      },
    } as unknown as jest.Mocked<NextResponse>;
  });

  it('should return true when policy is in the cookie', async () => {
    // Mock the cookies.get method for the first test
    (mockRequest.cookies.get as jest.Mock).mockReturnValue({
      value: JSON.stringify([policyNumber]),
    });

    // Act
    const result = await hasAcknowledgedPolicy(
      { planCode, policyNumber, user: {} as User },
      mockRequest,
      mockResponse
    );

    // Assert
    expect(result).toBe(true);
    expect(mockRequest.cookies.get).toHaveBeenCalledWith(
      ACKNOWLEDGEMENT_COOKIE_KEY
    );
    expect(mockLogTrace).toHaveBeenCalled();
    expect(mockCheckResetDeliveryDateEligibility).not.toHaveBeenCalled();
  });

  it('should return false when policy is not in cookie and eligibility check returns isEligible=true', async () => {
    // Arrange
    (mockRequest.cookies.get as jest.Mock).mockReturnValue({
      value: JSON.stringify([]),
    });

    mockCheckResetDeliveryDateEligibility.mockResolvedValue({
      data: {
        isEligible: true,
        policyNumber: policyNumber,
        planCode: planCode,
        reasons: [],
      },
      error: null,
    });

    // Act
    const result = await hasAcknowledgedPolicy(
      { planCode, policyNumber, user: {} as User },
      mockRequest,
      mockResponse
    );

    // Assert
    expect(result).toBe(false);
    expect(mockRequest.cookies.get).toHaveBeenCalledWith(
      ACKNOWLEDGEMENT_COOKIE_KEY
    );
    expect(mockCheckResetDeliveryDateEligibility).toHaveBeenCalledWith(
      {
        planCode,
        policyNumber,
      },
      expect.anything()
    );
    expect(mockLogTrace).toHaveBeenCalled();
    expect(mockResponse.cookies.set).not.toHaveBeenCalled();
  });

  it('should return true and set cookie when policy is not in cookie and eligibility check returns isEligible=false', async () => {
    // Arrange
    (mockRequest.cookies.get as jest.Mock).mockReturnValue({
      value: JSON.stringify([]),
    });

    mockCheckResetDeliveryDateEligibility.mockResolvedValue({
      data: {
        isEligible: false,
        policyNumber: policyNumber,
        planCode: planCode,
        reasons: [],
      },
      error: null,
    });

    // Act
    const result = await hasAcknowledgedPolicy(
      { planCode, policyNumber, user: {} as User },
      mockRequest,
      mockResponse
    );

    // Assert
    expect(result).toBe(true);
    expect(mockRequest.cookies.get).toHaveBeenCalledWith(
      ACKNOWLEDGEMENT_COOKIE_KEY
    );
    expect(mockCheckResetDeliveryDateEligibility).toHaveBeenCalledWith(
      {
        planCode,
        policyNumber,
      },
      expect.anything()
    );
    expect(mockResponse.cookies.set).toHaveBeenCalledWith(
      ACKNOWLEDGEMENT_COOKIE_KEY,
      JSON.stringify([policyNumber]),
      { domain: '.mocked-test-domain.com' }
    );
  });

  it('should handle empty cookie value', async () => {
    // Arrange
    (mockRequest.cookies.get as jest.Mock).mockReturnValue(undefined);

    mockCheckResetDeliveryDateEligibility.mockResolvedValue({
      data: {
        isEligible: false,
        policyNumber: policyNumber,
        planCode: planCode,
        reasons: [],
      },
      error: null,
    });

    // Act
    const result = await hasAcknowledgedPolicy(
      { planCode, policyNumber, user: {} as User },
      mockRequest,
      mockResponse
    );

    // Assert
    expect(result).toBe(true);
    expect(mockRequest.cookies.get).toHaveBeenCalledWith(
      ACKNOWLEDGEMENT_COOKIE_KEY
    );
    expect(mockCheckResetDeliveryDateEligibility).toHaveBeenCalledWith(
      {
        planCode,
        policyNumber,
      },
      expect.anything()
    );
    expect(mockResponse.cookies.set).toHaveBeenCalledWith(
      ACKNOWLEDGEMENT_COOKIE_KEY,
      JSON.stringify([policyNumber]),
      { domain: '.mocked-test-domain.com' }
    );
  });

  it('should append to existing cookie values when adding a new policy', async () => {
    // Arrange
    const existingPolicyNumber = 'EXISTING123';
    (mockRequest.cookies.get as jest.Mock).mockReturnValue({
      value: JSON.stringify([existingPolicyNumber]),
    });

    mockCheckResetDeliveryDateEligibility.mockResolvedValue({
      data: {
        isEligible: false,
        policyNumber: policyNumber,
        planCode: planCode,
        reasons: [],
      },
      error: null,
    });

    // Act
    const result = await hasAcknowledgedPolicy(
      { planCode, policyNumber, user: {} as User },
      mockRequest,
      mockResponse
    );

    // Assert
    expect(result).toBe(true);
    expect(mockResponse.cookies.set).toHaveBeenCalledWith(
      ACKNOWLEDGEMENT_COOKIE_KEY,
      JSON.stringify([existingPolicyNumber, policyNumber]),
      { domain: '.mocked-test-domain.com' }
    );
  });
});
