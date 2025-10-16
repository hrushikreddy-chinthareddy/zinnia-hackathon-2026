import { CarrierName } from '@zinnia/bloom/components';

import {
  CarrierConfig,
  DocumentsVersion,
  ManageChange,
  PaymentProvider,
} from '@/types/carrier-config';
import { CompanyName } from '@/types/carriers';
import { withLogging } from '@/utils/logging/with-logging';
import { getThemeCookies } from '@/utils/theme';

import { CARRIER_REDIRECT_URLS } from '../../carrier-config/urls';

export const getCarrierConfig = withLogging(
  async (): Promise<CarrierConfig> => {
    const currentCarrier = await getThemeCookies();

    const defaultConfig: CarrierConfig = {
      sso: {
        enabled: false,
      },
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
      riders: {
        showUnbornChildRider: false,
      },
      account: {
        surrender: {
          enabled: false,
        },
        partialOneTimeWithdrawal: {
          enabled: false,
        },
      },
      freeLookCancel: {
        enabled: false,
      },
      systematicPremium: {
        enabled: false,
      },
      // This should be temporary since eventually EDS (the documents team) will manage
      // the service the document is retrieved from depending on carrier. The logic for now
      // is that legacy carriers are on v2 and any new carriers from wellabe forward are on
      // v3. If this logic is still being used when onboarding a carrier, be sure to verify
      // which documents service they are using!
      documents: {
        version: DocumentsVersion.V3,
      },
    };

    switch (currentCarrier) {
      case CarrierName.FARMERS:
        return {
          ...defaultConfig,
          sso: {
            enabled: true,
          },
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
          account: {
            surrender: {
              enabled: true,
            },
            partialOneTimeWithdrawal: {
              enabled: true,
            },
          },
          freeLookCancel: {
            enabled: true,
          },
          systematicPremium: {
            enabled: true,
          },
        };

      case CompanyName.WELLABE:
        return {
          ...defaultConfig,
        };

      case CompanyName.EVERLY:
        return {
          ...defaultConfig,
          documents: {
            version: DocumentsVersion.V2,
          },
          riders: {
            showUnbornChildRider: true,
          },
        };

      default:
        return defaultConfig;
    }
  },
  { file: 'services/carrier-config', functionName: 'getCarrierConfig' }
);
