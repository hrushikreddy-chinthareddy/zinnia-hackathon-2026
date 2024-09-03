import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { ReactNode } from 'react';

import { EVERLY_CONTACT_PHONE_NUMBER } from '@/utils/data';

export const CallForAssistance = ({
  callToAction,
  contactPrompt = 'Call',
  customInstruction,
}: {
  callToAction?: ReactNode;
  contactPrompt?: string;
  customInstruction?: string;
}) => {
  return (
    <BannerAlert
      className="mb-lg"
      bodyText={
        <p className="typography-nav-links-sm-inline">
          <span>{callToAction}</span> <span>{contactPrompt}</span>{' '}
          <a href={`tel:+${EVERLY_CONTACT_PHONE_NUMBER}`}>
            {EVERLY_CONTACT_PHONE_NUMBER}
          </a>{' '}
          <span>{customInstruction}</span>
        </p>
      }
      variant={BannerVariant.Information}
    />
  );
};
