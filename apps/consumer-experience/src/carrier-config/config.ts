import { getThemeCookies } from '@/utils/theme';

import { CompanyName } from '@/types/carriers';

export enum PaymentProvider {
  ZINNIA = 'ZINNIA',
  PAYMENTUS = 'PAYMENTUS',
}
export interface PaymentConfig {
  provider: PaymentProvider;
  verifyIdentityRequired: boolean;
}

export const getCarrierConfig = async (): Promise<{
  payment: PaymentConfig;
}> => {
  const currentCarrier = await getThemeCookies();

  switch (currentCarrier) {
    case CompanyName.FARMERS:
      return {
        payment: {
          provider: PaymentProvider.PAYMENTUS,
          verifyIdentityRequired: false,
        },
      };

    default:
      return {
        payment: {
          provider: PaymentProvider.ZINNIA,
          verifyIdentityRequired: true,
        },
      };
  }
};
