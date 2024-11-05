import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { HTMLAttributes, ReactNode } from 'react';

import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

export const CallForAssistance = ({
  callToAction,
  carrierId,
  contactPrompt = 'Call',
  customInstruction,
}: {
  callToAction?: ReactNode;
  carrierId?: string | null;
  contactPrompt?: string;
  customInstruction?: string;
} & HTMLAttributes<HTMLDivElement>) => {
  return (
    <BannerAlert
      // TODO: eventually move this class out. This should be set by parent
      className="mb-lg"
      bodyText={
        <p className="typography-nav-links-sm-inline">
          <span>{callToAction}</span> <span>{contactPrompt}</span>{' '}
          <CarrierPhoneNumber carrierId={carrierId} />{' '}
          <span>{customInstruction}</span>
        </p>
      }
      variant={BannerVariant.Information}
    />
  );
};
