import { logError } from '@/utils/logging/log-fns';

import { EnterpriseTokenApi } from './enterprise-api-token-http';
import { logApiNotOkDetails } from '../utils/api';

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    has: jest.fn(),
  }),
}));

jest.mock('../utils/logging/log-fns', () => ({
  logError: jest.fn(),
  logTrace: jest.fn(),
  logWarn: jest.fn(),
}));

jest.mock('../utils/logging/server-logging', () => ({
  getUserInfoFromSession: jest.fn(),
}));

jest.mock('../utils/api', () => ({
  logApiNotOkDetails: jest.fn(),
}));

describe('EnterpriseTokenHttp', () => {
  let originalFetch: typeof global.fetch;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // set original implementation of fetch
    originalFetch = global.fetch;

    // set mock
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // reset mocks and tokens before each test
    jest.clearAllMocks();
    EnterpriseTokenApi['token'] = null;
    EnterpriseTokenApi['tokenExp'] = null;
  });

  afterEach(() => {
    // had to do this to restore the original fetch implementation
    // because the mock was not being cleared
    // and was causing issues with other tests
    // in the same file
    global.fetch = originalFetch;
  });

  it('should regenerate token if token is null or undefined', async () => {
    const mockTokenResponse = {
      access_token: 'new-token',
      expires_in: 8500,
    };

    // mock the first call to get the token
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      })
    );

    // mock the second call to the api
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      })
    );

    await EnterpriseTokenApi.request('https://example.com');

    expect(mockFetch).toHaveBeenCalledTimes(2);

    expect(EnterpriseTokenApi['token']).toBe('new-token');
    expect(EnterpriseTokenApi['tokenExp']).not.toBeNull();
  });

  it('should not regenerate token if expiration time has not passed', async () => {
    const currentToken = 'existing-token';
    const originalExpiration = Date.now() + 3600000; // 1 hour from now

    EnterpriseTokenApi['token'] = currentToken;
    EnterpriseTokenApi['tokenExp'] = originalExpiration;

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      })
    );

    await EnterpriseTokenApi.request('https://example.com');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(EnterpriseTokenApi['token']).toBe(currentToken);
    expect(EnterpriseTokenApi['tokenExp']).toBe(originalExpiration);
  });

  it('should regenerate token if expiration time has passed', async () => {
    const oldToken = 'old-token';
    const pastExpiration = Date.now() - 3600000; // 1 hour ago

    EnterpriseTokenApi['token'] = oldToken;
    EnterpriseTokenApi['tokenExp'] = pastExpiration;

    const mockTokenResponse = {
      access_token: 'new-token',
      expires_in: 8500,
    };

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      })
    );

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      })
    );

    await EnterpriseTokenApi.request('https://example.com');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(EnterpriseTokenApi['token']).toBe('new-token');
    expect(EnterpriseTokenApi['tokenExp']).toBeGreaterThan(Date.now());
  });

  it('should handle token generation error', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'invalid_request' }),
      })
    );

    await expect(
      EnterpriseTokenApi.request('https://example.com')
    ).rejects.toThrow();

    expect(logError).toHaveBeenCalled();
    expect(logApiNotOkDetails).toHaveBeenCalled();
  });

  it('should include correlation ID and authorization header in requests', async () => {
    const mockTokenResponse = {
      access_token: 'test-token',
      expires_in: 8500,
    };

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      })
    );

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      })
    );

    await EnterpriseTokenApi.request('https://example.com');

    // jest allows you to access the mock calls
    const requestHeaders = mockFetch.mock.calls[1][1].headers;
    expect(requestHeaders['x-correlation-id']).toBeDefined();
    expect(requestHeaders['Authorization']).toBe('Bearer test-token');
  });
});
