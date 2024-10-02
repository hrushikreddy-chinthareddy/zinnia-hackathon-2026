import { prependSubdomain } from './url';

describe('prependSubdomain', () => {
  it('should prepend a subdomain to the local dev environment', () => {
    process.env.AUTH0_COOKIE_DOMAIN = 'zinniatech.local';
    const subdomain = 'everly';
    const url = prependSubdomain(subdomain);
    expect(url).toBe(
      `http://${subdomain}.${process.env.AUTH0_COOKIE_DOMAIN}:3000`
    );
  });

  it('should prepend a subdomain to the live environment', () => {
    process.env.AUTH0_COOKIE_DOMAIN = 'qa.zinniatech';
    const subdomain = 'everly';
    const url = prependSubdomain(subdomain);
    expect(url).toBe(`https://${subdomain}.${process.env.AUTH0_COOKIE_DOMAIN}`);
  });
});
