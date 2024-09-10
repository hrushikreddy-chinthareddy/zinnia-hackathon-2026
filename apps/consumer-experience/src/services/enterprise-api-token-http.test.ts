import { EnterpriseTokenApi } from './enterprise-api-token-http';

jest.useFakeTimers().setSystemTime(new Date());

jest.mock('../utils/logging/server-logging', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
}));

jest.mock('../utils/api', () => ({
  logApiNotOkDetails: jest.fn(),
}));

describe('EnterpriseApiTokenHttp', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            access_token: '111111',
            expires_in: 8500,
          }),
      })
    ) as jest.Mock;
  });
  it('should not regenerate token if expiration time has not passed', async () => {
    const originalToken = 'original-token';
    const originalExpiration = Date.now() + 60 * 1000; // 1 minute from now
    EnterpriseTokenApi['token'] = originalToken;
    EnterpriseTokenApi['tokenExp'] = originalExpiration;

    await EnterpriseTokenApi.request('https://example.com');

    expect(EnterpriseTokenApi['token']).toBe(originalToken);
    expect(EnterpriseTokenApi['tokenExp']).toBe(originalExpiration);
  });

  it('should regenerate token if expiration time has passed', async () => {
    const originalToken = 'original-token';
    const originalExpiration = Date.now() - 60 * 1000; // 1 minute ago
    EnterpriseTokenApi['token'] = originalToken;
    EnterpriseTokenApi['tokenExp'] = originalExpiration;

    await EnterpriseTokenApi.request('https://example.com');

    expect(EnterpriseTokenApi['token']).not.toBe(originalToken);
    expect(EnterpriseTokenApi['tokenExp']).toBeGreaterThan(originalExpiration);
  });

  it('should regenerate token if token is null or undefined', async () => {
    EnterpriseTokenApi['token'] = null;
    EnterpriseTokenApi['tokenExp'] = null;

    await EnterpriseTokenApi.request('https://example.com');

    expect(EnterpriseTokenApi['token']).not.toBeNull();
    expect(EnterpriseTokenApi['tokenExp']).not.toBeNull();
  });
});
