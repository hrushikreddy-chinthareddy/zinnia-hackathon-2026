import { getSubdomain, prependSubdomain } from './url';

describe('prependSubdomain', () => {
  it('should prepend a subdomain to the local dev environment', () => {
    process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW = 'mypolicyview.local';
    const subdomain = 'everly';
    const url = prependSubdomain(subdomain);
    expect(url).toBe(
      `http://${subdomain}.${process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW}:3000`
    );
  });

  it('should prepend a subdomain to the live environment', () => {
    process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW = 'qa.mypolicyview';
    const subdomain = 'everly';
    const url = prependSubdomain(subdomain);
    expect(url).toBe(
      `https://${subdomain}.${process.env.AUTH0_COOKIE_DOMAIN_MYPOLICYVIEW}`
    );
  });
});

describe('getSubdomain', () => {
  it('returns the subdomain from the x-forwarded-host header', () => {
    const headers = new Headers({
      'x-forwarded-host': 'subdomain.example.com',
    });
    expect(getSubdomain(headers)).toBe('subdomain');
  });

  it('returns undefined if the x-forwarded-host header is missing', () => {
    const headers = new Headers();
    expect(getSubdomain(headers)).toBeUndefined();
  });

  it('returns undefined if the x-forwarded-host header is empty', () => {
    const headers = new Headers({
      'x-forwarded-host': '',
    });
    expect(getSubdomain(headers)).toBe('');
  });

  it('returns the first part of the x-forwarded-host header if it contains multiple dots', () => {
    const headers = new Headers({
      'x-forwarded-host': 'everly.zinniatech.com',
    });
    expect(getSubdomain(headers)).toBe('everly');
  });
});
