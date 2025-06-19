import { CompanyName } from '@/types/carriers';
import { PaymentConfig, PaymentProvider } from '@/types/payment';
import { getThemeCookies } from '@/utils/theme';

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
export { PaymentProvider };
