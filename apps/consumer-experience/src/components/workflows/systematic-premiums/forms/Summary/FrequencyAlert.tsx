import { BannerAlert, BannerVariant, IconType } from '@zinnia/bloom/components';

export const FrequencyAlert = ({
  paymentAmount = ' $X,XXX.XX ',
}: {
  paymentAmount?: string;
}) => {
  return (
    <BannerAlert
      icon={IconType.ALERT}
      variant={BannerVariant.Information}
      bodyText={`Changing your payment frequency updates your premium amount and next payment date.
              A one-time payment of ${paymentAmount} will be processed to cover the until the new schedule takes effect.`}
    />
  );
};
