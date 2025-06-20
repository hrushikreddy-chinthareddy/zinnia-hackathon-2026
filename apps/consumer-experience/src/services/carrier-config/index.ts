import {
  CarrierConfig,
  ManageChange,
  PaymentProvider,
} from '@/types/carrier-config';
import { CompanyName } from '@/types/carriers';
import { getThemeCookies } from '@/utils/theme';

export const getCarrierConfig = async (): Promise<CarrierConfig> => {
  const currentCarrier = await getThemeCookies();

  switch (currentCarrier) {
    case CompanyName.FARMERS:
      return {
        payment: {
          provider: PaymentProvider.PAYMENTUS,
          verifyIdentityRequired: false,
        },
        policyProfile: {
          communicationPreference: {
            manageChanges: ManageChange.EXTERNAL,
            url: `${process.env.NEXT_PUBLIC_SSO_FARMERS_REDIRECT_BASE_URL}/my-profile/communications`,
          },
          email: {
            manageChanges: ManageChange.EXTERNAL,
            url: `${process.env.NEXT_PUBLIC_SSO_FARMERS_REDIRECT_BASE_URL}/my-profile/primary`,
          },
          phoneNumber: {
            manageChanges: ManageChange.EXTERNAL,
            url: `${process.env.NEXT_PUBLIC_SSO_FARMERS_REDIRECT_BASE_URL}/my-profile/primary`,
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
