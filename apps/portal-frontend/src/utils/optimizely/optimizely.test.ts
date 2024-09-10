// portal-frontend/src/utils/optimizely/optimizely.test.ts
import { Client, createInstance } from '@optimizely/optimizely-sdk';

import { OptimizelyService } from './optimizely';

jest.mock('@auth0/nextjs-auth0', () => ({
    withPageAuthRequired: jest.fn(() => 'mocked withPageAuthRequired'),
}));

jest.mock('@deps/utils/server-logging', () => ({
    parseErrorInformation: jest.fn(),
    logError: jest.fn(),
}));

jest.mock('@optimizely/optimizely-sdk', () => ({
    createInstance: jest.fn(),
    OptimizelyDecideOption: {
        ENABLED_FLAGS_ONLY: 'ENABLED_FLAGS_ONLY',
        IGNORE_USER_PROFILE_SERVICE: 'IGNORE_USER_PROFILE_SERVICE',
    },
}));

describe('OptimizelyService', () => {
    let mockClient: jest.Mocked<Client>;

    beforeEach(() => {
        mockClient = {
            onReady: jest.fn().mockResolvedValue({ success: true }),
            createUserContext: jest.fn().mockReturnValue({
                decideAll: jest.fn().mockReturnValue({
                    flag1: { enabled: true },
                    flag2: { enabled: false },
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
        mockClient.onReady.mockResolvedValueOnce({ success: false, reason: 'some reason' });
        const service = new OptimizelyService('sdk_key', mockClient);
        await expect(service['ensureOnReady']()).rejects.toThrow('optimizely.ts::ensureOnReady:: instance onReady failed:: some reason');
    });

    it('should get feature flag decisions', async () => {
        const service = new OptimizelyService('sdk_key', mockClient);
        const userId = 'user123';
        const flags = await service.getFeatureFlagDecisions(userId);
        expect(mockClient.createUserContext).toHaveBeenCalledWith(userId, { userId });
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
});
