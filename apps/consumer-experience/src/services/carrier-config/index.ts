import { CarrierName } from '@zinnia/bloom/components';

import {
  CarrierConfig,
  ManageChange,
  PaymentProvider,
} from '@/types/carrier-config';
import { getThemeCookies } from '@/utils/theme';

import { CARRIER_REDIRECT_URLS } from '../../carrier-config/urls';

export const getCarrierConfig = async (): Promise<CarrierConfig> => {
  const currentCarrier = await getThemeCookies();

  switch (currentCarrier) {
    case CarrierName.FARMERS:
      return {
        payment: {
          provider: PaymentProvider.PAYMENTUS,
          verifyIdentityRequired: false,
        },
        policyProfile: {
          communicationPreference: {
            manageChanges: ManageChange.EXTERNAL,
            url: CARRIER_REDIRECT_URLS[CarrierName.FARMERS]
              .COMMUNICATION_PREFERENCES,
          },
          email: {
            manageChanges: ManageChange.EXTERNAL,
            url: CARRIER_REDIRECT_URLS[CarrierName.FARMERS].MANAGE_CHANGES,
          },
          phoneNumber: {
            manageChanges: ManageChange.EXTERNAL,
            url: CARRIER_REDIRECT_URLS[CarrierName.FARMERS].MANAGE_CHANGES,
          },
        },
      };

    default:
      return {
        payment: {
          provider: PaymentProvider.ZINNIA,
          verifyIdentityRequired: true,
        },
        policyProfile: {
          communicationPreference: {
            manageChanges: ManageChange.INTERNAL,
          },
          email: {
            manageChanges: ManageChange.INTERNAL,
          },
          phoneNumber: {
            manageChanges: ManageChange.INTERNAL,
          },
        },
      };
  }
};
