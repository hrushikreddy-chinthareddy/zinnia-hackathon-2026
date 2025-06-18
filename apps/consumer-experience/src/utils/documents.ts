import { Subdomains } from '@/types/carriers';

import { getThemeCookies } from './theme';

// TODO: decided to do this based on subdomain, but i could also update this to take
// in policyNumber and planCode, make a get documents call and do it on carrierId

// This should be a temporary check since eventually EDS (the documents team) will manage
// the service the document is retrieved from depending on carrier. The logic for now
// is that legacy carriers are on v2 and any new carriers from wellabe forward are on
// v3. If this logic is still being used when onboarding a carrier, be sure to verify
// which documents service they are using!
export const retrieveDocumentsFromV2 = async (): Promise<boolean> => {
  const carrierId = await getThemeCookies();

  switch (carrierId) {
    case Subdomains.EVERLY:
      return true;
    default:
      return false;
  }
};
