import { CompanyName } from '@/types/carriers';

// Carriers that need to have redirect urls configured
enum REDIRECT_CARRIERS {
  FARMERS = CompanyName.FARMERS,
}

// Base URLs
const CARRIER_REDIRECT_BASE_URLS: Record<REDIRECT_CARRIERS, string> = {
  [CompanyName.FARMERS]: process.env.NEXT_PUBLIC_SSO_FARMERS_REDIRECT_BASE_URL,
};

// Farmers Config

// URL pathnames
enum FarmersURLS {
  POLICY_SUMMARY = 'policysummary',
  COMMUNICATION_PREFERENCES = 'my-profile/communications',
  MANAGE_CHANGES = 'my-profile/primary',
}

// each url must have a query param
// `?isZinniaSso=true`
// See [CUI-987](https://zinnia.atlassian.net/browse/CUI-987)
export const CARRIER_REDIRECT_URLS = {
  [CompanyName.FARMERS]: {
    POLICY_SUMMARY: `${CARRIER_REDIRECT_BASE_URLS[CompanyName.FARMERS]}/${FarmersURLS.POLICY_SUMMARY}?isZinniaSso=true`,
    COMMUNICATION_PREFERENCES: `${CARRIER_REDIRECT_BASE_URLS[CompanyName.FARMERS]}/${FarmersURLS.COMMUNICATION_PREFERENCES}?isZinniaSso=true`,
    MANAGE_CHANGES: `${CARRIER_REDIRECT_BASE_URLS[CompanyName.FARMERS]}/${FarmersURLS.MANAGE_CHANGES}?isZinniaSso=true`,
  },
};
