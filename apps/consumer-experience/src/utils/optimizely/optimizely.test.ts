import { Client, createInstance } from '@optimizely/optimizely-sdk';

import { OptimizelyService } from './optimizely';
import { getThemeCookies } from '../theme';

jest.mock('../logging/log-fns', () => ({
  logError: jest.fn(),
}));

jest.mock('@optimizely/optimizely-sdk', () => ({
  createInstance: jest.fn(),
  OptimizelyDecideOption: {
    ENABLED_FLAGS_ONLY: 'ENABLED_FLAGS_ONLY',
    IGNORE_USER_PROFILE_SERVICE: 'IGNORE_USER_PROFILE_SERVICE',
  },
}));

jest.mock('../theme', () => ({
  getThemeCookies: jest.fn().mockResolvedValue('everly'),
}));

describe('OptimizelyService', () => {
  let mockClient: jest.Mocked<Client>;

  beforeEach(() => {
    mockClient = {
      onReady: jest.fn().mockResolvedValue({ success: true }),
      createUserContext: jest.fn().mockReturnValue({
        decideAll: jest.fn().mockReturnValue({
          flag1: { enabled: true, variables: {} },
          flag2: { enabled: false, variables: {} },
        }),
      }),
    } as unknown as jest.Mocked<Client>;
  });

  it('should initialize with given client', () => {
    const service = new OptimizelyService('sdk_key', mockClient);
    expect(service).toBeDefined();
    expect(service['optimizelyClient']).toBe(mockClient);
  });

  it('should initialize with created client if none is provided', () => {
    (createInstance as jest.Mock).mockReturnValue(mockClient);
    const service = new OptimizelyService('sdk_key');
    expect(service).toBeDefined();
    expect(service['optimizelyClient']).toBe(mockClient);
    expect(createInstance).toHaveBeenCalledWith({ sdkKey: 'sdk_key' });
  });

  it('should call onReady successfully', async () => {
    const service = new OptimizelyService('sdk_key', mockClient);
    await service['ensureOnReady']();
    expect(mockClient.onReady).toHaveBeenCalled();
    expect(service['onReadyCalled']).toBe(true);
  });

  it('should throw error if onReady fails', async () => {
    mockClient.onReady.mockResolvedValueOnce({
      success: false,
      reason: 'some reason',
    });
    const service = new OptimizelyService('sdk_key', mockClient);
    await expect(service['ensureOnReady']()).rejects.toThrow(
      'optimizely.ts::ensureOnReady:: instance onReady failed:: some reason'
    );
  });

  it('should get feature flag decisions', async () => {
    const service = new OptimizelyService('sdk_key', mockClient);
    const userId = 'user123';
    const flags = await service.getFeatureFlagDecisions(userId);
    expect(mockClient.createUserContext).toHaveBeenCalledWith(userId, {
      userId,
    });
    expect(flags).toEqual({
      flag1: true,
      flag2: false,
    });
  });

  it('should get feature flag decisions twice and call onready once', async () => {
    const service = new OptimizelyService('sdk_key', mockClient);
    const userId = 'user123';
    await service.getFeatureFlagDecisions(userId);
    await service.getFeatureFlagDecisions(userId);
    expect(mockClient.onReady).toHaveBeenCalledTimes(1);
  });

  it('should handle errors in getFeatureFlagDecisions', async () => {
    mockClient.createUserContext.mockReturnValueOnce(null);
    const service = new OptimizelyService('sdk_key', mockClient);
    const userId = 'user123';
    const flags = await service.getFeatureFlagDecisions(userId);
    expect(flags).toEqual({});
  });

  it('should return empty object in getFeatureFlagDecisions when sdkKey is not provided', async () => {
    mockClient.createUserContext.mockReturnValueOnce(null);
    const service = new OptimizelyService('', mockClient);
    const userId = 'user123';
    const flags = await service.getFeatureFlagDecisions(userId);
    expect(flags).toEqual({});
  });

  it('should prioritize theme variables over enabled flag when variables exist', async () => {
    // Mock client with variables in the response
    mockClient = {
      onReady: jest.fn().mockResolvedValue({ success: true }),
      createUserContext: jest.fn().mockReturnValue({
        decideAll: jest.fn().mockReturnValue({
          flag1: {
            enabled: true,
            variables: {
              everly: false, // Variable is false while enabled is true
            },
          },
          flag2: {
            enabled: false,
            variables: {},
          },
        }),
      }),
    } as unknown as jest.Mocked<Client>;

    // Mock theme to match the variable key
    (getThemeCookies as jest.Mock).mockResolvedValue('everly');

    const service = new OptimizelyService('sdk_key', mockClient);
    const userId = 'user123';
    const flags = await service.getFeatureFlagDecisions(userId);

    // Should use the variable value (false) instead of the enabled value (true)
    expect(flags).toEqual({
      flag1: false,
      flag2: false,
    });
  });

  it('should use enabled value when theme variable does not exist', async () => {
    // Mock client with variables for a different theme
    mockClient = {
      onReady: jest.fn().mockResolvedValue({ success: true }),
      createUserContext: jest.fn().mockReturnValue({
        decideAll: jest.fn().mockReturnValue({
          flag1: {
            enabled: true,
            variables: {
              otherTheme: false, // Variable exists but for different theme
            },
          },
          flag2: {
            enabled: true,
            variables: {
              everly: true, // This one matches our theme
            },
          },
        }),
      }),
    } as unknown as jest.Mocked<Client>;

    // Mock theme
    (getThemeCookies as jest.Mock).mockResolvedValue('everly');

    const service = new OptimizelyService('sdk_key', mockClient);
    const userId = 'user123';
    const flags = await service.getFeatureFlagDecisions(userId);

    // flag1 should use enabled value, flag2 should use variable value
    expect(flags).toEqual({
      flag1: true,
      flag2: true,
    });
  });

  it('should handle undefined theme by using enabled values', async () => {
    // Mock client with variables
    mockClient = {
      onReady: jest.fn().mockResolvedValue({ success: true }),
      createUserContext: jest.fn().mockReturnValue({
        decideAll: jest.fn().mockReturnValue({
          flag1: {
            enabled: true,
            variables: {
              everly: false,
              default: true,
            },
          },
          flag2: {
            enabled: true,
            variables: {
              everly: true,
            },
          },
        }),
      }),
    } as unknown as jest.Mocked<Client>;

    // Mock theme as undefined
    (getThemeCookies as jest.Mock).mockResolvedValue(undefined);

    const service = new OptimizelyService('sdk_key', mockClient);
    const userId = 'user123';
    const flags = await service.getFeatureFlagDecisions(userId);

    // Should use enabled values since theme is undefined
    expect(flags).toEqual({
      flag1: true,
      flag2: true,
    });
  });
});
