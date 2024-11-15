import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { HTMLAttributes, ReactNode } from 'react';

import { CarrierPhoneNumber } from '../carrier-phone-number/CarrierPhoneNumber';

export const CallForAssistance = ({
  callToAction,
  contactPrompt = 'Call',
  customInstruction,
}: {
  callToAction?: ReactNode;
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
          <CarrierPhoneNumber /> <span>{customInstruction}</span>
        </p>
      }
      variant={BannerVariant.Information}
    />
  );
};
